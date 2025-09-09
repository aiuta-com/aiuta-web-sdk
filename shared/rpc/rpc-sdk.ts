/**
 * Aiuta RPC SDK implementation for web-sdk side
 */

import type { SdkHandlers, SdkContext, SdkCapabilities } from './api-sdk'
import type { AppApi } from './api-app'
import { PROTOCOL_VERSION, DEFAULT_HANDSHAKE_TIMEOUT } from './core'
import { AiutaRpcBase, type AnyFn } from './base'
import { createRpcClient, createRpcServer } from './generic'
import { extractFunctionPaths, jsonSafeClone } from './utils'

import type { ConnectionInfo, ConnectionOptions } from './base'

/**
 * SDK-specific connection info
 */
type SdkConnectionInfo = ConnectionInfo & {
  client: ReturnType<typeof createRpcClient<AppApi>>
}

/**
 * Aiuta RPC SDK - manages communication with iframe applications
 * Supports multiple iframe connections with independent management
 */
export class AiutaRpcSdk extends AiutaRpcBase<SdkHandlers, AppApi, SdkContext> {
  private connections = new Map<string, SdkConnectionInfo>()
  private handshakeListeners = new Map<string, (event: MessageEvent) => void>()

  // Legacy properties for backward compatibility
  private get appClient() {
    return this.connections.get('default')?.client
  }

  private handshakeListener?: (event: MessageEvent) => void

  /**
   * Connect to an iframe with RPC communication
   * @param iframeEl - Target iframe element
   * @param connectionIdOrOrigin - Connection ID or legacy origin parameter
   * @returns Promise that resolves when connection is established
   */
  async connect(
    iframeEl: HTMLIFrameElement,
    connectionIdOrOrigin?: string | ConnectionOptions,
  ): Promise<this> {
    // Handle backward compatibility
    let connectionId = 'default'
    let expectedIframeOrigin: string | undefined

    if (typeof connectionIdOrOrigin === 'string') {
      // Legacy: second parameter is expectedIframeOrigin
      expectedIframeOrigin = connectionIdOrOrigin
    } else if (connectionIdOrOrigin && typeof connectionIdOrOrigin === 'object') {
      // New API: options object
      connectionId = connectionIdOrOrigin.connectionId || 'default'
      expectedIframeOrigin = connectionIdOrOrigin.expectedIframeOrigin
    }

    return this.connectWithId(iframeEl, connectionId, expectedIframeOrigin)
  }

  /**
   * Internal method to connect with specific connection ID
   */
  private async connectWithId(
    iframeEl: HTMLIFrameElement,
    connectionId: string,
    expectedIframeOrigin?: string,
  ): Promise<this> {
    if (!iframeEl.contentWindow) throw new Error('Iframe has no contentWindow')

    // Check if already connected
    if (this.connections.has(connectionId)) {
      throw new Error(`Connection with ID '${connectionId}' already exists`)
    }

    const resolvedOrigin = expectedIframeOrigin || this.inferIframeOrigin(iframeEl)
    if (!resolvedOrigin) {
      throw new Error('Unable to determine expected iframe origin')
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const listener = this.handshakeListeners.get(connectionId)
        if (listener) {
          window.removeEventListener('message', listener)
          this.handshakeListeners.delete(connectionId)
        }
        reject(new Error(`SDK handshake timeout for connection: ${connectionId}`))
      }, DEFAULT_HANDSHAKE_TIMEOUT)

      const handshakeListener = (e: MessageEvent) => {
        // Quick filter: only process messages from correct iframe
        if (e.source !== iframeEl.contentWindow || e.origin !== resolvedOrigin) {
          return
        }

        const d = e.data as { type: 'app:hello'; nonce: string; appVersion?: string } | any

        // Quick filter: only process RPC handshake messages
        if (!d || d.type !== 'app:hello') {
          return
        }

        const ch = new MessageChannel()
        const port1 = ch.port1
        const port2 = ch.port2

        const extra: Record<string, AnyFn> = {
          getConfigurationSnapshot: async () => {
            const result = {
              data: jsonSafeClone(this._context.cfg),
              functionKeys: extractFunctionPaths(this._context.cfg),
            }
            return result
          },
          invokeConfigFunction: async (path: string, ...args: any[]) => {
            const parts = path.split('.')
            let cur: any = this._context.cfg
            for (const p of parts) cur = cur?.[p]
            if (typeof cur !== 'function') throw new Error(`Config function not found: ${path}`)
            return await cur(...args)
          },
          getCapabilities: async (): Promise<SdkCapabilities> => ({
            protocolVersion: PROTOCOL_VERSION,
            sdkVersion: this._context.sdkVersion,
            methods: Object.keys(registry),
          }),
        }

        const registry = this.buildRegistry({
          ...extra,
          trackEvent: (event: Record<string, unknown>) =>
            this._handlers.trackEvent?.(event, { appVersion: d.appVersion }),
        })
        const methods = Object.keys(registry)

        const ack = {
          type: 'sdk:ack',
          nonce: d.nonce,
          version: PROTOCOL_VERSION,
          sdkVersion: this._context.sdkVersion,
          methods,
        }

        // Create RPC server BEFORE sending ack so it's ready for incoming calls
        createRpcServer(port1, registry)
        const client = createRpcClient<AppApi>(port1)

        try {
          iframeEl.contentWindow!.postMessage(ack, resolvedOrigin, [port2])
        } catch (error) {
          console.error('[RPC SDK] Failed to send ack message:', error)
          clearTimeout(timeout)
          reject(new Error(`Failed to send handshake ack: ${error}`))
          return
        }

        // Store connection
        this.connections.set(connectionId, {
          client,
          appVersion: d.appVersion,
          iframe: iframeEl,
        })

        clearTimeout(timeout)
        window.removeEventListener('message', handshakeListener)
        this.handshakeListeners.delete(connectionId)
        resolve()
      }

      this.handshakeListeners.set(connectionId, handshakeListener)
      window.addEventListener('message', handshakeListener)
    })

    return this
  }

  /**
   * Infer iframe origin from its src attribute
   */
  private inferIframeOrigin(iframeEl: HTMLIFrameElement): string | undefined {
    try {
      const iframeSrc = iframeEl.src
      if (iframeSrc) {
        const url = new URL(iframeSrc)
        return url.origin
      }
    } catch (error) {
      console.warn('Failed to infer iframe origin:', error)
    }
    return undefined
  }

  /**
   * Get app API for default connection (backward compatibility)
   */
  get app() {
    if (!this.appClient) throw new Error('AiutaRpcSdk: not connected')
    return this.appClient.api
  }

  /**
   * Get API for specific connection
   * @param connectionId - ID of the connection
   * @returns Connection details with API access
   */
  connection(connectionId: string) {
    const conn = this.connections.get(connectionId)
    if (!conn) {
      throw new Error(
        `Connection '${connectionId}' not found. Available connections: ${Array.from(this.connections.keys()).join(', ')}`,
      )
    }
    return {
      api: conn.client.api,
      appVersion: conn.appVersion,
      iframe: conn.iframe,
    }
  }

  /**
   * Get all active connection IDs
   */
  getConnections(): string[] {
    return Array.from(this.connections.keys())
  }

  /**
   * Check if connection exists
   */
  hasConnection(connectionId: string): boolean {
    return this.connections.has(connectionId)
  }

  /**
   * Disconnect specific connection
   */
  disconnect(connectionId: string): void {
    const conn = this.connections.get(connectionId)
    if (conn) {
      conn.client.close()
      this.connections.delete(connectionId)
    }

    const listener = this.handshakeListeners.get(connectionId)
    if (listener) {
      window.removeEventListener('message', listener)
      this.handshakeListeners.delete(connectionId)
    }
  }

  /**
   * Close all connections and cleanup resources
   */
  close() {
    super.close()

    // Close all connections
    for (const [connectionId] of this.connections) {
      this.disconnect(connectionId)
    }

    this.connections.clear()
    this.handshakeListeners.clear()

    // Legacy cleanup
    if (this.handshakeListener) {
      window.removeEventListener('message', this.handshakeListener)
      this.handshakeListener = undefined
    }
  }
}

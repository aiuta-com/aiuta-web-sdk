/**
 * Aiuta RPC SDK implementation for web-sdk side
 */

import type { SdkApi, SdkContext } from '../api/sdk'
import type { AppApi } from '../api/app'
import type { InternalSdkMethods } from '../protocol/internal'
import {
  PROTOCOL_VERSION,
  HANDSHAKE_TIMEOUT,
  HANDSHAKE_MESSAGE_HELLO,
  HANDSHAKE_MESSAGE_ACK,
  AnyFn,
} from '../protocol/core'
import { AiutaRpcBase } from './base'
import { createRpcClient, createRpcServer } from '../protocol/transport'
import { extractFunctionPaths, jsonSafeClone } from '../protocol/utils'

/**
 * Aiuta SDK RPC - manages communication with single iframe application
 */
export class AiutaSdkRpc<TConfig = Record<string, unknown>> extends AiutaRpcBase<
  SdkApi,
  AppApi,
  SdkContext<TConfig>
> {
  private appClient?: ReturnType<typeof createRpcClient<AppApi>>
  private handshakeListener?: (event: MessageEvent) => void

  /**
   * Connect to iframe with RPC communication
   * @param iframeEl - Target iframe element
   * @param expectedIframeOrigin - Expected iframe origin (optional, will be inferred if not provided)
   * @returns Promise that resolves when connection is established
   */
  async connect(iframeEl: HTMLIFrameElement, expectedIframeOrigin?: string): Promise<this> {
    if (!iframeEl.contentWindow) throw new Error('Iframe has no contentWindow')

    // Check if already connected
    if (this.appClient) {
      throw new Error('RPC connection already exists')
    }

    const resolvedOrigin = expectedIframeOrigin || this.inferIframeOrigin(iframeEl)
    if (!resolvedOrigin) {
      throw new Error('Unable to determine expected iframe origin')
    }

    return this.performHandshake(iframeEl, resolvedOrigin)
  }

  /**
   * Perform handshake with iframe
   */
  private async performHandshake(
    iframeEl: HTMLIFrameElement,
    resolvedOrigin: string,
  ): Promise<this> {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
          this.handshakeListener = undefined
        }
        reject(new Error('SDK handshake timeout'))
      }, HANDSHAKE_TIMEOUT)

      this.handshakeListener = (e: MessageEvent) => {
        // Quick filter: only process messages from correct iframe
        if (e.source !== iframeEl.contentWindow || e.origin !== resolvedOrigin) {
          return
        }

        const d = e.data as
          | { type: typeof HANDSHAKE_MESSAGE_HELLO; nonce: string; appVersion?: string }
          | any

        // Quick filter: only process RPC handshake messages
        if (!d || d.type !== HANDSHAKE_MESSAGE_HELLO) {
          return
        }

        const ch = new MessageChannel()
        const port1 = ch.port1
        const port2 = ch.port2

        const internalMethods: InternalSdkMethods = {
          getConfigSnapshot: async () => {
            const result = {
              data: jsonSafeClone(this._context.config) as Record<string, unknown>,
              functionKeys: extractFunctionPaths(this._context.config),
            }
            return result
          },
          invokeConfigFunction: async (path: string, ...args: any[]) => {
            const parts = path.split('.')
            let cur: any = this._context.config
            for (const p of parts) cur = cur?.[p]
            if (typeof cur !== 'function')
              throw new Error(`Configuration function not found: ${path}`)
            return await cur(...args)
          },
        }

        const allHandlers = {
          ...this.buildRegistry(),
          ...(internalMethods as Record<string, AnyFn>),
        }
        const registry = allHandlers
        const methods = Object.keys(registry)

        const ack = {
          type: HANDSHAKE_MESSAGE_ACK,
          nonce: d.nonce,
          version: PROTOCOL_VERSION,
          sdkVersion: this._context.sdkVersion,
          methods,
        }

        // Create RPC server BEFORE sending ack so it's ready for incoming calls
        createRpcServer(port1, registry)
        this.appClient = createRpcClient<AppApi>(port1)

        try {
          iframeEl.contentWindow!.postMessage(ack, resolvedOrigin, [port2])
        } catch (error) {
          console.error('[RPC SDK] Failed to send ack message:', error)
          clearTimeout(timeout)
          reject(new Error(`Failed to send handshake ack: ${error}`))
          return
        }

        // Connection established successfully - enrich context with app version
        if (d.appVersion) {
          this._context.appVersion = d.appVersion
        }

        clearTimeout(timeout)
        window.removeEventListener('message', this.handshakeListener!)
        this.handshakeListener = undefined
        resolve()
      }

      window.addEventListener('message', this.handshakeListener)
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
   * Get app API
   */
  get app() {
    if (!this.appClient) throw new Error('AiutaSdkRpc: not connected')
    return this.appClient.api
  }

  /**
   * Check if connected to iframe
   */
  isConnected(): boolean {
    return !!this.appClient
  }

  /**
   * Close connection and cleanup resources
   */
  close() {
    super.close()

    // Close RPC client
    if (this.appClient) {
      this.appClient.close()
      this.appClient = undefined
    }

    // Remove handshake listener
    if (this.handshakeListener) {
      window.removeEventListener('message', this.handshakeListener)
      this.handshakeListener = undefined
    }
  }
}

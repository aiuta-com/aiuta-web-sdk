/**
 * Aiuta RPC App implementation for iframe applications
 */

import type { AiutaConfiguration } from '@lib/config'
import type { SdkApi } from '../api/sdk'
import type { AppApi, AppContext } from '../api/app'
import type { InternalSdkApi } from '../protocol/internal'
import {
  PROTOCOL_VERSION,
  HANDSHAKE_TIMEOUT,
  HANDSHAKE_MESSAGE_HELLO,
  HANDSHAKE_MESSAGE_ACK,
} from '../protocol/core'
import { AiutaRpcBase } from './base'
import { createRpcClient, createRpcServer } from '../protocol/transport'
import { jsonSafeClone, setByPath, rand } from '../protocol/utils'

/**
 * Aiuta App RPC - manages communication with parent SDK
 * Used inside iframe applications to communicate with the parent SDK
 */
export class AiutaAppRpc extends AiutaRpcBase<AppApi, SdkApi, AppContext> {
  sdk!: SdkApi
  config!: AiutaConfiguration
  private expectedParentOrigin?: string
  private handshakeListener?: (event: MessageEvent) => void
  private sdkClient?: ReturnType<typeof createRpcClient<InternalSdkApi>>
  private internalSdk!: InternalSdkApi

  /**
   * Connect to parent SDK with secure handshake
   * @returns Promise that resolves when connection is established
   */
  async connect(): Promise<this> {
    // 1. Get expected parent origin from URL parameters
    this.expectedParentOrigin = this.getExpectedParentOriginFromUrl()

    // 2. Perform secure handshake with origin validation
    const { port, methodsFromAck } = await this.performSecureHandshake()

    // 3. Setup RPC connection (both client and server for bidirectional communication)
    // Create server for handling calls from SDK (e.g., tryOn)
    createRpcServer(port, this.buildRegistry())

    // Create client for calling SDK methods (e.g., getConfigSnapshot)
    this.sdkClient = createRpcClient<InternalSdkApi>(port)
    this.internalSdk = this.sdkClient.api
    this.sdk = this.sdkClient.api

    this._supports = new Set(methodsFromAck ?? [])

    const snap = await this.internalSdk.getConfigSnapshot()
    const cfg = jsonSafeClone(snap.data) as AiutaConfiguration | null
    if (!cfg) {
      throw new Error('Failed to clone configuration data')
    }

    for (const path of snap.functionKeys) {
      setByPath(cfg as any, path, (...args: any[]) =>
        this.internalSdk.invokeConfigFunction(path, ...args),
      )
    }
    this.config = cfg

    return this
  }

  /**
   * Get expected parent origin from URL parameters
   * The parent origin must be passed as a URL parameter for security
   */
  private getExpectedParentOriginFromUrl(): string {
    const urlParams = new URLSearchParams(window.location.search)
    const parentOrigin = urlParams.get('parentOrigin')

    if (!parentOrigin) {
      throw new Error('parentOrigin parameter is required in iframe URL')
    }

    try {
      return new URL(parentOrigin).origin
    } catch {
      throw new Error(`Invalid parentOrigin format: ${parentOrigin}`)
    }
  }

  /**
   * Perform secure handshake with parent SDK
   */
  private async performSecureHandshake(): Promise<{
    port: MessagePort
    methodsFromAck?: string[]
  }> {
    const nonce = rand()

    return new Promise<{
      port: MessagePort
      methodsFromAck?: string[]
    }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
        }
        reject(new Error('App handshake timeout'))
      }, HANDSHAKE_TIMEOUT)

      this.handshakeListener = (e: MessageEvent) => {
        // Validate origin
        if (e.origin !== this.expectedParentOrigin) {
          console.warn(
            `[RPC APP] Rejected handshake from unexpected origin: ${e.origin}, expected: ${this.expectedParentOrigin}`,
          )
          return
        }

        const d = e.data as
          | {
              type: typeof HANDSHAKE_MESSAGE_ACK
              nonce: string
              sdkVersion?: string
              methods?: string[]
            }
          | any
        if (!d || d.type !== HANDSHAKE_MESSAGE_ACK) return
        if (d.nonce !== nonce) return

        const p = e.ports?.[0]

        if (!p) {
          clearTimeout(timeout)
          reject(new Error('No port in handshake response'))
          return
        }

        clearTimeout(timeout)
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
          this.handshakeListener = undefined
        }

        // Enrich context with SDK version
        if (d.sdkVersion) {
          this._context.sdkVersion = d.sdkVersion
        }

        resolve({ port: p, methodsFromAck: d.methods })
      }

      window.addEventListener('message', this.handshakeListener)

      try {
        const helloMessage = {
          type: HANDSHAKE_MESSAGE_HELLO,
          nonce,
          version: PROTOCOL_VERSION,
          appVersion: this._context.appVersion,
        }
        window.parent.postMessage(helloMessage, this.expectedParentOrigin!)
      } catch (error) {
        clearTimeout(timeout)
        reject(new Error(`Failed to send handshake: ${error}`))
      }
    })
  }

  /**
   * Close connection and cleanup resources
   */
  close() {
    super.close()

    // Close RPC client
    if (this.sdkClient) {
      this.sdkClient.close()
      this.sdkClient = undefined
    }

    // Remove handshake listener
    if (this.handshakeListener) {
      window.removeEventListener('message', this.handshakeListener)
      this.handshakeListener = undefined
    }
  }
}

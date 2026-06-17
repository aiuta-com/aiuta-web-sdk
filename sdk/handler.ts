import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaSdkRpc } from '@lib/rpc'
import type { SdkApi, SdkContext } from '@lib/rpc'
import type { AiutaConfiguration, AiutaMode } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private rpc: AiutaSdkRpc<AiutaConfiguration>
  // De-dupes concurrent connects: rapid repeated tryOn calls before the
  // handshake completes must await the same connection, not start new ones
  private connecting?: Promise<void>

  constructor(
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
    private readonly logger: Logger,
  ) {
    const handlers: SdkApi = {
      trackEvent: (event) => {
        this.analytics.track(event)
      },
      setInteractive: (interactive) => {
        this.iframeManager.setInteractive(interactive)
      },
    }

    const context: SdkContext<AiutaConfiguration> = {
      config: this.configuration,
      sdkVersion: __SDK_VERSION__,
    }

    this.rpc = new AiutaSdkRpc<AiutaConfiguration>({
      context,
      handlers,
    })
  }

  async startTryOn(productIds: string[], mode: AiutaMode) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        await this.ensureConnected(iframe)
        await this.rpc.app.tryOn(productIds, mode)
      }
    } catch (error) {
      this.logger.error('Aiuta RPC tryOn failed:', error)
      this.analytics.track({ type: 'session', event: 'rpcFailed' })
    }
  }

  async clearStorage() {
    const iframe = this.iframeManager.getIframe()
    if (!iframe) return

    // No catch: an older app without the handler rejects with
    // "Unknown method" — let the caller see the failure
    await this.ensureConnected(iframe)
    await this.rpc.app.clearStorage()
  }

  private async ensureConnected(iframe: HTMLIFrameElement) {
    if (this.rpc.isConnected()) return

    // Reuse an in-flight connection so concurrent callers don't open parallel
    // handshakes (which would race over the message port and break RPC). On
    // failure the promise is cleared so a later call can retry.
    if (!this.connecting) {
      this.connecting = this.connect(iframe).finally(() => {
        this.connecting = undefined
      })
    }

    await this.connecting
  }

  private async connect(iframe: HTMLIFrameElement) {
    await this.rpc.connect(iframe)

    if (this.rpc.context.appVersion) {
      this.analytics.setIframeVersion(this.rpc.context.appVersion)
    }

    this.analytics.track({ type: 'session', event: 'iframeLoaded' })
  }
}

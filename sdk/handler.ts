import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaSdkRpc } from '@lib/rpc'
import type { SdkApi, SdkContext } from '@lib/rpc'
import type { AiutaConfiguration } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private rpc: AiutaSdkRpc<AiutaConfiguration>

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

  async startTryOn(productIds: string[]) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        if (!this.rpc.isConnected()) {
          await this.rpc.connect(iframe)

          if (this.rpc.context.appVersion) {
            this.analytics.setIframeVersion(this.rpc.context.appVersion)
          }

          this.analytics.track({ type: 'session', event: 'iframeLoaded' })
        }

        await this.rpc.app.tryOn(productIds)
      }
    } catch (error) {
      this.logger.error('Aiuta RPC tryOn failed:', error)
      this.analytics.track({ type: 'session', event: 'rpcFailed' })
    }
  }
}

import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaRpcSdk } from '@lib/rpc'
import type { SdkHandlers, SdkContext } from '@lib/rpc'
import type { AiutaConfiguration } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private rpc: AiutaRpcSdk<AiutaConfiguration>

  constructor(
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
    private readonly logger: Logger,
  ) {
    const handlers: SdkHandlers = {
      trackEvent: (event) => {
        this.analytics.track({ data: event })
      },
      setInteractive: (interactive) => {
        this.iframeManager.setInteractive(interactive)
      },
    }

    const context: SdkContext<AiutaConfiguration> = {
      configuration: this.configuration,
      sdkVersion: __SDK_VERSION__,
    }

    this.rpc = new AiutaRpcSdk<AiutaConfiguration>({
      context,
      handlers,
    })
  }

  async startTryOn(productId: string) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        if (!this.rpc.isConnected()) {
          await this.rpc.connect(iframe)

          if (this.rpc.context.appVersion) {
            this.analytics.setIframeVersion(this.rpc.context.appVersion)
          }

          this.analytics.track({ data: { type: 'session', event: 'iframeLoaded' } })
        }

        await this.rpc.app.tryOn(productId)
      }
    } catch (error) {
      this.logger.error('Aiuta RPC tryOn failed:', error)
      this.analytics.track({ data: { type: 'session', event: 'rpcFailed' } })
    }
  }
}

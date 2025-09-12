// import { SecurePostMessageHandler } from './security' // TODO: Remove if not needed
import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaRpcSdk } from '@lib/rpc'
import type { SdkHandlers, SdkContext } from '@lib/rpc'
import type { AiutaConfiguration } from '@lib/config'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private rpc: AiutaRpcSdk<AiutaConfiguration>

  constructor(
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
  ) {
    const handlers: SdkHandlers = {
      trackEvent: (event, ctx) => {
        if (ctx.appVersion) {
          this.analytics.setIframeVersion(ctx.appVersion)
        }
        this.analytics.track({ data: event })
      },
      closeModal: () => {
        this.iframeManager.closeOrHide()
      },
    }

    const context: SdkContext<AiutaConfiguration> = {
      cfg: this.configuration,
      sdkVersion: __SDK_VERSION__,
    }

    this.rpc = new AiutaRpcSdk<AiutaConfiguration>({
      context,
      handlers,
    })

    window.addEventListener('resize', () => {
      this.sendWindowSizes()
    })
  }

  async startTryOn(productId: string) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        if (!this.rpc.hasConnection()) {
          await this.rpc.connect(iframe)
          await this.sendWindowSizes()
          const sdkVersion = this.rpc.context.sdkVersion
          if (sdkVersion) {
            this.analytics.setIframeVersion(sdkVersion)
          }
          this.analytics.track({ data: { type: 'session', event: 'iframeLoaded' } })
        }

        await this.rpc.app.tryOn(productId)
      }
    } catch (error) {
      console.error('Aiuta RPC tryOn failed:', error)
      this.analytics.track({ data: { type: 'session', event: 'rpcFailed' } })
    }
  }

  private async sendWindowSizes() {
    try {
      if (this.rpc.hasConnection()) {
        const sizes = {
          width: window.innerWidth,
          height: window.innerHeight,
        }
        await this.rpc.app.updateWindowSizes(sizes)
      }
    } catch (error) {
      console.error('RPC sendWindowSizes failed:', error)
    }
  }
}

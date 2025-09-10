// import { SecurePostMessageHandler } from './security' // TODO: Remove if not needed
import AuthManager from './auth'
import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaRpcSdk } from '@shared/rpc'
import type { SdkHandlers, SdkContext } from '@shared/rpc'
import type { AiutaConfiguration } from '@shared/config'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private rpcSdk!: AiutaRpcSdk<AiutaConfiguration>

  constructor(
    _auth: AuthManager, // TODO: Remove if not needed
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
  ) {
    this.initializeRpc()
    this.setupResizeListener()
  }

  private initializeRpc() {
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

    this.rpcSdk = new AiutaRpcSdk<AiutaConfiguration>({
      context,
      handlers,
    })
  }

  setProductId() {
    // TODO: Remove this method if not needed
  }

  async tryOnViaRpc(productId: string) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        if (!this.rpcSdk.hasConnection()) {
          await this.rpcSdk.connect(iframe)
          await this.sendWindowSizesViaRpc()
          const sdkVersion = this.rpcSdk.context.sdkVersion
          if (sdkVersion) {
            this.analytics.setIframeVersion(sdkVersion)
          }
          this.analytics.track({ data: { type: 'session', event: 'iframeLoaded' } })
        }

        await this.rpcSdk.app.tryOn(productId)
      }
    } catch (error) {
      console.error('RPC tryOn failed:', error)
    }
  }

  private async sendWindowSizesViaRpc() {
    try {
      if (this.rpcSdk.hasConnection()) {
        const sizes = {
          width: window.innerWidth,
          height: window.innerHeight,
        }
        await this.rpcSdk.app.updateWindowSizes(sizes)
      }
    } catch (error) {
      console.error('[RPC SDK] sendWindowSizes failed:', error)
    }
  }

  private setupResizeListener() {
    window.addEventListener('resize', () => {
      this.sendWindowSizesViaRpc()
    })
  }
}

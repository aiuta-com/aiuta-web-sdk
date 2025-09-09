import { AiutaConfiguration } from '@shared/config'
import AuthManager from './auth'
import IframeManager from './iframe'
import MessageHandler from './handler'
import AnalyticsTracker from './analytics'
import { AiutaRpcSdk } from '@shared/rpc'
import type { SdkHandlers } from '@shared/rpc'

export default class Aiuta {
  private auth: AuthManager
  private analytics: AnalyticsTracker
  private iframeManager: IframeManager
  private messageHandler: MessageHandler
  private rpcSdk: AiutaRpcSdk

  constructor(configuration: AiutaConfiguration) {
    this.auth = new AuthManager(configuration.auth)
    this.analytics = new AnalyticsTracker(configuration.analytics)
    this.iframeManager = new IframeManager(configuration.userInterface)
    this.messageHandler = new MessageHandler(this.auth, this.analytics, this.iframeManager)

    // Initialize RPC SDK
    const handlers: SdkHandlers = {
      trackEvent: (event, ctx) => {
        console.log('[RPC SDK] Received trackEvent:', event, 'from context:', ctx)
        this.analytics.track({ data: event })
      },
    }

    this.rpcSdk = new AiutaRpcSdk({
      context: {
        cfg: configuration as unknown as Record<string, unknown>,
        sdkVersion: '1.0.0', // TODO: get from package.json or constants
      },
      handlers,
    })

    this.analytics.track({ data: { type: 'configure' } })
  }

  async tryOn(productId: string) {
    if (!productId || !productId.length) {
      console.error('Product id is not provided for Aiuta.')
      return
    }

    // Show iframe and connect via RPC
    this.iframeManager.showMainFrame()

    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        await this.rpcSdk.connect(iframe)
        await this.rpcSdk.app.tryOn(productId)
      }
    } catch (error) {
      console.error('RPC tryOn failed:', error)
      // Fallback: set product ID directly for iframe to pick up
      this.messageHandler.setProductId(productId)
    }

    // Analytics
    this.analytics.track({
      data: {
        type: 'session',
        flow: 'tryOn',
        productIds: [productId],
      },
    })
  }
}

export type {
  AiutaConfiguration,
  AiutaAuth,
  AiutaApiKeyAuth,
  AiutaJwtAuth,
  AiutaUserInterface,
  AiutaFeatures,
  AiutaAnalytics,
  AiutaDebugSettings,
  AiutaIframePosition,
  AiutaStylesConfiguration,
  AiutaAnalyticsCallback,
  AiutaJwtCallback,
} from '@shared/config'

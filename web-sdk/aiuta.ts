import { AiutaConfiguration } from '@shared/config'
import AuthManager from './auth'
import IframeManager from './iframe'
import MessageHandler from './handler'
import AnalyticsTracker from './analytics'

export default class Aiuta {
  private auth: AuthManager
  private analytics: AnalyticsTracker
  private iframeManager: IframeManager
  private messageHandler: MessageHandler

  constructor(configuration: AiutaConfiguration) {
    this.auth = new AuthManager(configuration.auth)
    this.analytics = new AnalyticsTracker(configuration.analytics)
    this.iframeManager = new IframeManager(configuration.userInterface)
    this.messageHandler = new MessageHandler(
      this.auth,
      this.analytics,
      this.iframeManager,
      configuration,
    )

    this.analytics.track({ data: { type: 'configure' } })
  }

  async tryOn(productId: string) {
    if (!productId || !productId.length) {
      console.error('Product id is not provided for Aiuta.')
      return
    }

    // Show iframe first
    this.iframeManager.showMainFrame()

    try {
      // Try RPC first
      await this.messageHandler.tryOnViaRpc(productId)
    } catch {
      // RPC failed, messageHandler already set productId as fallback
      console.error('RPC tryOn failed, using legacy fallback')
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
  AiutaAnalyticsCallback,
  AiutaJwtCallback,
} from '@shared/config'

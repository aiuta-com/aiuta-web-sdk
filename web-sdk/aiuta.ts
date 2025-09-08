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
    this.messageHandler = new MessageHandler(this.auth, this.analytics, this.iframeManager)
    this.analytics.track({ data: { type: 'configure' } })
  }

  tryOn(productId: string) {
    if (!productId || !productId.length) {
      console.error('Product id is not provided for Aiuta.')
      return
    }
    this.messageHandler.setProductId(productId)
    this.iframeManager.showMainFrame()
    const analytic: any = {
      data: {
        type: 'session',
        flow: 'tryOn',
        productIds: [productId],
      },
    }
    this.analytics.track(analytic)
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

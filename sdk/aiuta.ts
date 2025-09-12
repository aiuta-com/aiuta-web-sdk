import { AiutaConfiguration } from '@lib/config'
import IframeManager from './iframe'
import MessageHandler from './handler'
import AnalyticsTracker from './analytics'

export default class Aiuta {
  private analytics: AnalyticsTracker
  private iframeManager: IframeManager
  private messageHandler: MessageHandler

  constructor(configuration: AiutaConfiguration) {
    this.analytics = new AnalyticsTracker(configuration.analytics)
    this.iframeManager = new IframeManager(configuration.userInterface)
    this.messageHandler = new MessageHandler(this.analytics, this.iframeManager, configuration)

    this.analytics.track({ data: { type: 'configure' } })
  }

  async tryOn(productId: string) {
    if (!productId || !productId.length) {
      console.error('Product id is not provided for Aiuta')
      return
    }

    this.iframeManager.showMainFrame()
    this.messageHandler.startTryOn(productId)

    this.analytics.track({
      data: {
        type: 'session',
        flow: 'tryOn',
        productIds: [productId],
      },
    })
  }
}

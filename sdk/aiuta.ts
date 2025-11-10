import { AiutaConfiguration } from '@lib/config'
import { createLogger, type Logger } from '@lib/logger'
import IframeManager from './iframe'
import MessageHandler from './handler'
import AnalyticsTracker from './analytics'

export default class Aiuta {
  private analytics: AnalyticsTracker
  private iframeManager: IframeManager
  private messageHandler: MessageHandler
  private logger: Logger

  constructor(configuration: AiutaConfiguration) {
    const isLoggingEnabled = configuration.debugSettings?.isLoggingEnabled ?? false
    this.logger = createLogger('aiuta:sdk', isLoggingEnabled)

    this.analytics = new AnalyticsTracker(configuration.analytics, this.logger)
    this.iframeManager = new IframeManager(configuration.userInterface, this.logger)
    this.messageHandler = new MessageHandler(
      this.analytics,
      this.iframeManager,
      configuration,
      this.logger,
    )

    this.analytics.track({ type: 'configure' })
  }

  async tryOn(productId: string | string[]) {
    // Support both single product and multi-item try-on
    const productIds = Array.isArray(productId) ? productId : [productId]

    if (!productIds.length || productIds.some((id) => !id || !id.length)) {
      this.logger.error('Product id(s) are not provided for Aiuta')
      return
    }

    this.iframeManager.ensureIframe()
    this.messageHandler.startTryOn(productIds)

    this.analytics.track({
      type: 'session',
      flow: 'tryOn',
      productIds,
    })
  }
}

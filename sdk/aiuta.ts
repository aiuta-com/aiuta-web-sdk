import { AiutaConfiguration, AiutaMode } from '@lib/config'
import { createLogger, type Logger } from '@lib/logger'
import IframeManager from './iframe'
import MessageHandler from './handler'
import AnalyticsTracker from './analytics'

/**
 * Aiuta SDK main class
 *
 * Manages the virtual try-on experience by coordinating iframe lifecycle,
 * message handling, and analytics tracking. Automatically removes any existing
 * iframe when a new instance is created.
 *
 * @example
 * ```typescript
 * const aiuta = new Aiuta({
 *   auth: { apiKey: 'your-api-key' }
 * });
 *
 * // Start try-on for a product
 * await aiuta.tryOn('product-123');
 *
 * // Or for multiple products
 * await aiuta.tryOn(['product-1', 'product-2']);
 *
 * // Manually cleanup when done
 * aiuta.destroy();
 * ```
 */
export default class Aiuta {
  /** Analytics tracker for user behavior and events */
  private analytics: AnalyticsTracker

  /** Manager for iframe creation, lifecycle, and interaction */
  private iframeManager: IframeManager

  /** Handler for communication between parent window and iframe */
  private messageHandler: MessageHandler

  /** Logger instance for debugging and monitoring */
  private logger: Logger

  /** Flag indicating if this instance has been destroyed */
  private isDestroyed: boolean = false

  /**
   * Creates a new Aiuta SDK instance
   *
   * Automatically removes any existing iframe from the DOM to ensure
   * a clean state. This handles cases where a previous instance was
   * created or the instance reference was lost.
   *
   * @param configuration - SDK configuration including auth, analytics, and UI settings
   */
  constructor(configuration: AiutaConfiguration) {
    const isLoggingEnabled = configuration.debugSettings?.isLoggingEnabled ?? false
    this.logger = createLogger('aiuta:sdk', isLoggingEnabled)

    this.analytics = new AnalyticsTracker(configuration.analytics, this.logger)
    this.iframeManager = new IframeManager(configuration, this.logger)
    this.iframeManager.removeIframe()
    this.messageHandler = new MessageHandler(
      this.analytics,
      this.iframeManager,
      configuration,
      this.logger,
    )

    this.analytics.track({ type: 'configure' })

    // Preload the iframe so the app bundle downloads and boots in the background
    // before the first tryOn — on a slow connection this is the difference
    // between an instant open and waiting (or timing out) on click. The app
    // re-broadcasts its handshake HELLO until the SDK connects on tryOn.
    this.iframeManager.ensureIframe().catch((error) => {
      this.logger.warn('Aiuta iframe preload failed:', error)
    })
  }

  /**
   * Starts the virtual try-on experience for one or more products
   *
   * Opens the Aiuta iframe with the specified product(s) and initiates
   * the try-on flow. Tracks analytics for the session.
   *
   * @param productId - Single product ID or array of product IDs to try on
   * @param mode - Try-on mode driving the UI context (onboarding, photo
   *   guidance, error texts); the generation flow itself is identical.
   *   Defaults to 'general'.
   * @returns Promise that resolves when try-on is initiated
   * @throws Error if this instance has been destroyed. Create a new Aiuta instance instead.
   *
   * @example
   * ```typescript
   * // Single product
   * await aiuta.tryOn('product-123');
   *
   * // Multiple products
   * await aiuta.tryOn(['product-1', 'product-2', 'product-3']);
   *
   * // Shoes try-on
   * await aiuta.tryOn('sneakers-42', 'shoes');
   * ```
   */
  async tryOn(productId: string | string[], mode: AiutaMode = 'general') {
    // Check if instance has been destroyed
    if (this.isDestroyed) {
      const error =
        'Cannot call tryOn() on destroyed Aiuta instance. Please create a new Aiuta instance.'
      this.logger.error(error)
      throw new Error(error)
    }

    // Support both single product and multi-item try-on
    const productIds = Array.isArray(productId) ? productId : [productId]

    if (!productIds.length || productIds.some((id) => !id || !id.length)) {
      this.logger.error('Product id(s) are not provided for Aiuta')
      return
    }

    // Partners call from untyped JS — fall back instead of breaking the flow
    if (mode !== 'general' && mode !== 'shoes') {
      this.logger.error(`Unknown try-on mode "${mode}", falling back to "general"`)
      mode = 'general'
    }

    this.analytics.track({
      type: 'session',
      flow: 'tryOn',
      productIds,
      mode,
    })

    await this.iframeManager.ensureIframe()
    await this.messageHandler.startTryOn(productIds, mode)
  }

  /**
   * Wipes all user data the SDK stores locally: uploaded photos, generation
   * history, consents, onboarding statuses and caches.
   *
   * Intended for testing and debug tooling — the user effectively becomes a
   * first-time visitor on the next try-on.
   *
   * @returns Promise that resolves when the storage has been cleared
   * @throws Error if this instance has been destroyed, or if the loaded app
   *   version does not support this method
   */
  async clearStorage() {
    if (this.isDestroyed) {
      const error =
        'Cannot call clearStorage() on destroyed Aiuta instance. Please create a new Aiuta instance.'
      this.logger.error(error)
      throw new Error(error)
    }

    await this.iframeManager.ensureIframe()
    await this.messageHandler.clearStorage()
  }

  /**
   * Cleanup method to remove iframe and release resources
   *
   * Removes the Aiuta iframe from the DOM and marks this instance as destroyed.
   * After calling destroy(), this instance cannot be used anymore.
   * Any subsequent calls to tryOn() will throw an error.
   *
   * @example
   * ```typescript
   * const aiuta = new Aiuta(config);
   * // ... use SDK
   * aiuta.destroy(); // Manual cleanup
   *
   * // This will throw an error:
   * // await aiuta.tryOn('product-123');
   *
   * // Create a new instance instead:
   * const newAiuta = new Aiuta(config);
   * await newAiuta.tryOn('product-123');
   * ```
   */
  destroy() {
    this.logger.debug('Destroying Aiuta instance')
    this.iframeManager.removeIframe()

    // Mark instance as destroyed to prevent further use
    this.isDestroyed = true
  }
}

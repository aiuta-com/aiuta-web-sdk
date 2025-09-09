/**
 * App API definitions
 *
 * This file contains API contracts that SDK can call on App side
 */

/**
 * App API - methods that SDK can call on App
 */
export interface AppApi {
  /**
   * Trigger try-on flow for a specific product
   * @param productId - ID of the product to try on
   */
  tryOn(productId: string): Promise<void>
}

/**
 * App-side handlers (methods that App implements for SDK to call)
 */
export type AppHandlers = {
  /**
   * Handle try-on request from SDK
   * @param productId - ID of the product to try on
   */
  tryOn: (productId: string) => Promise<void> | void
}

/**
 * App context passed during initialization
 */
export interface AppContext {
  appVersion: string
}

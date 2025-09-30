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
 * App context passed during initialization
 */
export interface AppContext {
  appVersion: string
  sdkVersion?: string // Set after successful handshake
}

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
   * Trigger try-on flow for one or multiple products
   * @param productIds - Single product ID or array of product IDs (for multi-item try-on)
   *
   * Supports backward compatibility:
   * - Old SDK: tryOn('product-id')
   * - New SDK: tryOn(['product-id-1', 'product-id-2'])
   */
  tryOn(productIds: string | string[]): Promise<void>
}

/**
 * App context passed during initialization
 */
export interface AppContext {
  appVersion: string
  sdkVersion?: string // Set after successful handshake
}

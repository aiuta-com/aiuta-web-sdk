/**
 * App API definitions
 *
 * This file contains API contracts that SDK can call on App side
 */

import type { AiutaMode } from '../../config'

/**
 * App API - methods that SDK can call on App
 */
export interface AppApi {
  /**
   * Trigger try-on flow for one or multiple products
   * @param productIds - Single product ID or array of product IDs (for multi-item try-on)
   * @param mode - Try-on mode driving the UI context; defaults to 'general'
   *
   * Supports backward compatibility:
   * - Old SDK: tryOn('product-id')
   * - New SDK: tryOn(['product-id-1', 'product-id-2'], 'shoes')
   * The mode is a trailing optional arg: an older app ignores it (general
   * behavior), an older SDK omits it and the app defaults to 'general'.
   */
  tryOn(productIds: string | string[], mode?: AiutaMode): Promise<void>

  /**
   * Wipe all locally stored user data (uploads, generations, consents,
   * onboarding statuses, caches). Debug/maintenance method.
   *
   * Older apps don't implement it — the RPC responds with "Unknown method",
   * which the SDK side logs without breaking.
   */
  clearStorage(): Promise<void>
}

/**
 * App context passed during initialization
 */
export interface AppContext {
  appVersion: string
  sdkVersion?: string // Set after successful handshake
}

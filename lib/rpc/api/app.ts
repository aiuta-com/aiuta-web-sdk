/**
 * App API definitions
 *
 * This file contains API contracts that SDK can call on App side
 */

import type { AiutaMode } from '../../config'

/** Per-request options forwarded with a tryOn call (trailing optional arg). */
export interface TryOnRequestOptions {
  /** Product gender → default predefined-model category for this try-on. */
  gender?: string
}

/**
 * App API - methods that SDK can call on App
 */
export interface AppApi {
  /**
   * Trigger try-on flow for one or multiple products
   * @param productIds - Single product ID or array of product IDs (for multi-item try-on)
   * @param mode - Try-on mode driving the UI context; defaults to 'general'
   * @param options - Per-request options (e.g. product gender); optional
   *
   * Supports backward compatibility:
   * - Old SDK: tryOn('product-id')
   * - New SDK: tryOn(['product-id-1', 'product-id-2'], 'shoes')
   * Both trailing args are optional: an older app ignores them (general
   * behavior), an older SDK omits them and the app uses its defaults.
   */
  tryOn(
    productIds: string | string[],
    mode?: AiutaMode,
    options?: TryOnRequestOptions,
  ): Promise<void>

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

/**
 * SDK API definitions
 *
 * This file contains API contracts that App can call on SDK side
 */

/**
 * SDK API - methods that App can call on SDK
 */
export interface SdkApi {
  /**
   * Send analytics event to the parent SDK
   * @param event - Event data to track
   */
  trackEvent(event: Record<string, unknown>): void | Promise<void>

  /**
   * Set iframe interactivity state
   * @param interactive - Whether iframe should be interactive (receive pointer events)
   */
  setInteractive(interactive: boolean): void | Promise<void>
}

/**
 * SDK context passed during initialization
 */
export interface SdkContext<TConfig = Record<string, unknown>> {
  config: TConfig
  sdkVersion: string
  appVersion?: string // Set after successful handshake
}

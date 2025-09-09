/**
 * SDK API definitions
 *
 * This file contains API contracts that App can call on SDK side
 */

/**
 * SDK capabilities information
 */
export interface SdkCapabilities {
  protocolVersion: string
  sdkVersion: string
  methods: string[]
}

/**
 * SDK API - methods that App can call on SDK
 */
export interface SdkApi {
  /**
   * Get a snapshot of the current configuration
   * Returns cloned data and list of function paths that can be invoked
   */
  getConfigurationSnapshot(): Promise<{
    data: Record<string, unknown>
    functionKeys: string[]
  }>

  /**
   * Invoke a function from the configuration by its path
   * @param path - Dot-separated path to the function (e.g., 'auth.getToken')
   * @param args - Arguments to pass to the function
   */
  invokeConfigFunction(path: string, ...args: any[]): Promise<any>

  /**
   * Send analytics event to the parent SDK
   * @param event - Event data to track
   */
  trackEvent(event: Record<string, unknown>): Promise<void>

  /**
   * Get SDK capabilities and available methods
   */
  getCapabilities(): Promise<SdkCapabilities>
}

/**
 * SDK-side handlers (methods that SDK implements for App to call)
 */
export type SdkHandlers = {
  /**
   * Handle analytics events from the App
   * @param event - Analytics event data
   * @param ctx - Context information (app version, etc.)
   */
  trackEvent?: (
    event: Record<string, unknown>,
    ctx: { appVersion?: string },
  ) => void | Promise<void>
}

/**
 * SDK context passed during initialization
 */
export interface SdkContext<TConfig = Record<string, unknown>> {
  cfg: TConfig
  sdkVersion: string
}

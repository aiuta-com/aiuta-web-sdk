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
   * Get SDK capabilities and available methods
   */
  getCapabilities(): Promise<SdkCapabilities>

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
  invokeConfigurationFunction(path: string, ...args: any[]): Promise<any>

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
 * Built-in SDK methods that are handled automatically (App calls these on SDK)
 */
type SdkBuiltInHandlers =
  | 'getCapabilities'
  | 'getConfigurationSnapshot'
  | 'invokeConfigurationFunction'

/**
 * SDK-side handlers (methods that SDK implements for App to call)
 */
export type SdkHandlers = {
  [K in Exclude<keyof SdkApi, SdkBuiltInHandlers>]?: SdkApi[K]
}

/**
 * SDK context passed during initialization
 */
export interface SdkContext<TConfig = Record<string, unknown>> {
  configuration: TConfig
  sdkVersion: string
  appVersion?: string // Set after successful handshake
}

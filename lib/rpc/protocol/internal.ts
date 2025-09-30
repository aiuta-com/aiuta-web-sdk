/**
 * Internal RPC methods for configuration management
 *
 * These methods are used internally by the RPC system for configuration
 * proxy and should not be part of the public API.
 */

import type { SdkApi } from '../api/sdk'

/**
 * Internal SDK methods used by App for configuration management
 * These are not part of the public SdkApi
 */
export interface InternalSdkApi extends SdkApi {
  /**
   * Get a snapshot of the current configuration
   * Returns cloned data and list of function paths that can be invoked
   */
  getConfigSnapshot(): Promise<{
    data: Record<string, unknown>
    functionKeys: string[]
  }>

  /**
   * Invoke a function from the configuration by its path
   * @param path - Dot-separated path to the function (e.g., 'auth.getToken')
   * @param args - Arguments to pass to the function
   */
  invokeConfigFunction(path: string, ...args: any[]): Promise<any>
}

/**
 * Internal methods registry type for SDK side
 */
export type InternalSdkMethods = {
  [K in keyof Omit<InternalSdkApi, keyof SdkApi>]: InternalSdkApi[K]
}

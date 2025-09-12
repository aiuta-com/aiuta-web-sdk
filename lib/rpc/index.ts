/**
 * Aiuta RPC System - Public API
 *
 * Main entry point for the RPC communication system between
 * SDK and iframe applications.
 */

// Main RPC classes
export { AiutaRpcSdk } from './rpc-sdk'
export { AiutaRpcApp } from './rpc-app'

// Public API types that users actually need
export type {
  // SDK API interfaces (for App developers)
  SdkApi,
  SdkHandlers,
  SdkContext,
} from './api-sdk'

export type {
  // App API interfaces (for SDK developers)
  AppApi,
  AppHandlers,
  AppContext,
} from './api-app'

/**
 * Aiuta RPC System - Public API
 *
 * Main entry point for the RPC communication system between
 * SDK and iframe Application.
 */

// Main RPC classes
export { AiutaSdkRpc, AiutaAppRpc } from './clients'

// Public API types that users actually need
export type {
  // SDK API interfaces (for App developers)
  SdkApi,
  SdkContext,
  // App API interfaces (for SDK developers)
  AppApi,
  AppContext,
} from './api'

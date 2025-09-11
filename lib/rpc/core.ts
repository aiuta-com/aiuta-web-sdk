/**
 * Core RPC protocol types and constants
 *
 * This file contains the fundamental types and constants for the RPC protocol
 */

/* ---------- Core RPC Protocol Types ---------- */

export type RpcReq = { t: 'call'; id: number; m: string; a: any[] }
export type RpcRes =
  | { t: 'resp'; id: number; ok: true; r: any }
  | { t: 'resp'; id: number; ok: false; e: string }

/* ---------- Protocol Constants ---------- */

export const PROTOCOL_VERSION = '1.0.0'
export const DEFAULT_CONNECTION_ID = 'default'
export const DEFAULT_RPC_TIMEOUT = 15_000
export const DEFAULT_HANDSHAKE_TIMEOUT = 10_000

/* ---------- Generic Result Types ---------- */

/**
 * Result type for RPC client creation
 */
export interface RpcClientResult<TApi> {
  api: TApi
  call: (method: string, ...args: any[]) => Promise<any>
  close: () => void
}

/**
 * Result type for RPC server creation
 */
export interface RpcServerResult {
  close: () => void
}

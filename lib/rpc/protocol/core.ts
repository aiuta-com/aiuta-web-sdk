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

export type AnyFn = (...args: any[]) => any

/* ---------- Protocol Constants ---------- */

export const PROTOCOL_VERSION = '1.0.0'
export const RPC_TIMEOUT = 15_000
// The SDK opens the handshake right after creating the iframe, so this window
// also has to cover the app bundle downloading and booting inside the iframe —
// not just the HELLO/ACK round trip. Keep it generous so a slow connection
// (e.g. throttled mobile) doesn't error out mid-load.
export const HANDSHAKE_TIMEOUT = 30_000
// The app re-broadcasts HELLO on this interval until it gets an ACK. With the
// iframe preloaded, the app boots before the SDK attaches its handshake
// listener (that happens on the first tryOn), so a single HELLO would be missed.
export const HANDSHAKE_HELLO_RETRY_MS = 300

/* ---------- Handshake Message Types ---------- */

export const HANDSHAKE_MESSAGE_HELLO = 'aiuta:app:hello'
export const HANDSHAKE_MESSAGE_ACK = 'aiuta:sdk:ack'

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

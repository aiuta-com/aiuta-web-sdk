/**
 * Base class for Aiuta RPC instances
 */

import type { RpcClientResult } from './core'

/* ---------- Internal Base Types ---------- */

export type AnyFn = (...args: any[]) => any

/**
 * Base configuration for RPC instances
 */
export interface RpcBaseConfig<THandlers, TContext> {
  context: TContext
  handlers: THandlers
}

/**
 * Connection information for multi-iframe support
 */
export interface ConnectionInfo {
  client: any // RPC client instance
  appVersion?: string
  iframe: HTMLIFrameElement
}

/**
 * Connection options for SDK.connect()
 */
export interface ConnectionOptions {
  connectionId?: string
  expectedIframeOrigin?: string
}

/**
 * Abstract base class for RPC implementations
 * Provides common functionality for both SDK and App sides
 */
export abstract class AiutaRpcBase<
  TLocalHandlers extends Record<string, AnyFn>,
  TRemoteApi extends object,
  TContext extends object,
> {
  protected _client?: RpcClientResult<TRemoteApi>
  protected _supports = new Set<string>()
  protected _context: TContext
  protected _handlers: TLocalHandlers

  constructor(opts: RpcBaseConfig<TLocalHandlers, TContext>) {
    this._context = opts.context
    this._handlers = opts.handlers
  }

  /**
   * Get the context of the RPC instance
   * @returns The context of the RPC instance
   */
  get context() {
    return this._context
  }

  /**
   * Build registry of methods that can be called by remote side
   * @param extra - Additional methods to include in registry
   * @returns Complete method registry
   */
  protected buildRegistry(extra?: Record<string, AnyFn>): Record<string, AnyFn> {
    return { ...this._handlers, ...(extra ?? {}) }
  }

  /**
   * Check if remote side supports a specific method
   * @param methodName - Name of the method to check
   * @returns True if method is supported
   */
  supports(methodName: keyof TRemoteApi | string) {
    return this._supports.has(String(methodName))
  }

  /**
   * Close the RPC connection and cleanup resources
   * Override in subclasses for additional cleanup
   */
  close() {
    this._client?.close()
    // Override in subclasses for additional cleanup
  }
}

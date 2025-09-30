/**
 * Base class for Aiuta RPC instances
 */

import type { AnyFn } from '../protocol/core'

/* ---------- Internal Base Types ---------- */

/**
 * Base configuration for RPC instances
 */
export interface RpcBaseConfig<THandlers, TContext> {
  context: TContext
  handlers: THandlers
}

/**
 * Abstract base class for RPC implementations
 * Provides common functionality for both SDK and App sides
 */
export abstract class AiutaRpcBase<
  TLocalHandlers extends object,
  TRemoteApi extends object,
  TContext extends object,
> {
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
    return { ...(this._handlers as Record<string, AnyFn>), ...(extra ?? {}) }
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
    // Override in subclasses for cleanup
  }
}

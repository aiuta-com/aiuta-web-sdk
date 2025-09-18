/**
 * Generic RPC implementation for MessagePort communication
 */

import type { RpcReq, RpcRes, RpcClientResult, RpcServerResult } from './core'
import { DEFAULT_RPC_TIMEOUT } from './core'
import type { AnyFn } from '../shared/base'

/**
 * Create an RPC client for calling remote methods
 * @param port - MessagePort for communication
 * @param timeoutMs - Timeout for RPC calls in milliseconds
 * @returns RPC client with typed API
 */
export function createRpcClient<TApi extends object>(
  port: MessagePort,
  timeoutMs = DEFAULT_RPC_TIMEOUT,
): RpcClientResult<TApi> {
  let seq = 0
  let isClosed = false
  const pending = new Map<number, { res: (v: any) => void; rej: (e: any) => void; t: number }>()

  // Start MessagePort to enable message reception
  port.start()

  // Use addEventListener instead of onmessage (onmessage doesn't work reliably)
  port.addEventListener('message', (ev: MessageEvent<RpcRes>) => {
    if (isClosed) return
    const m = ev.data
    if (!m || m.t !== 'resp') return
    const p = pending.get(m.id)
    if (!p) return
    clearTimeout(p.t)
    pending.delete(m.id)
    if (m.ok) p.res(m.r)
    else p.rej(new Error(m.e))
  })

  const call = (method: string, ...args: any[]) =>
    new Promise((res, rej) => {
      if (isClosed) {
        rej(new Error('RPC client is closed'))
        return
      }
      const id = ++seq
      const timer = window.setTimeout(() => {
        pending.delete(id)
        rej(new Error(`RPC timeout: ${method}`))
      }, timeoutMs)
      pending.set(id, { res, rej, t: timer })
      const msg: RpcReq = { t: 'call', id, m: method, a: args }
      try {
        port.postMessage(msg)
      } catch (error) {
        clearTimeout(timer)
        pending.delete(id)
        rej(new Error(`Failed to send RPC message: ${error}`))
      }
    })

  const api = new Proxy(
    {},
    {
      get: (_t, prop) => (typeof prop === 'string' ? (...a: any[]) => call(prop, ...a) : undefined),
    },
  ) as unknown as TApi

  return {
    api,
    call,
    close: () => {
      if (isClosed) return
      isClosed = true
      port.close()
      pending.forEach((p) => clearTimeout(p.t))
      pending.clear()
    },
  }
}

/**
 * Create an RPC server for handling remote method calls
 * @param port - MessagePort for communication
 * @param registry - Map of method names to handler functions
 * @returns RPC server instance
 */
export function createRpcServer(
  port: MessagePort,
  registry: Record<string, AnyFn>,
): RpcServerResult {
  // Start MessagePort to enable message reception
  port.start()

  // Use addEventListener instead of onmessage (onmessage doesn't work reliably)
  port.addEventListener('message', async (ev: MessageEvent<RpcReq>) => {
    const m = ev.data
    if (!m || m.t !== 'call') {
      return
    }
    const fn = registry[m.m]
    if (!fn) {
      port.postMessage({ t: 'resp', id: m.id, ok: false, e: `Unknown method: ${m.m}` })
      return
    }
    try {
      const r = await fn(...(m.a ?? []))
      port.postMessage({ t: 'resp', id: m.id, ok: true, r })
    } catch (e: any) {
      port.postMessage({ t: 'resp', id: m.id, ok: false, e: String(e?.message ?? e) })
    }
  })
  return { close: () => port.close() }
}

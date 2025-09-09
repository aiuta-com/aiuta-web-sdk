// shared/aiuta-rpc.ts
import type { AiutaConfiguration } from '@shared/config'

type AnyFn = (...args: any[]) => any
type RpcReq = { t: 'call'; id: number; m: string; a: any[] }
type RpcRes =
  | { t: 'resp'; id: number; ok: true; r: any }
  | { t: 'resp'; id: number; ok: false; e: string }

const PROTOCOL_VERSION = '1.0.0'
const rand = () => crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

/* ---------- utils ---------- */

function extractFunctionPaths(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return []
  const out: string[] = []
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'function') out.push(key)
    else if (v && typeof v === 'object') out.push(...extractFunctionPaths(v, key))
  }
  return out
}

function jsonSafeClone<T>(v: T): any {
  try {
    return JSON.parse(JSON.stringify(v ?? {}))
  } catch {
    return {}
  }
}

function setByPath(obj: Record<string, any>, path: string, value: any) {
  const parts = path.split('.')
  let cur = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
}

/* ---------- generic RPC ---------- */

function createRpcClient<TApi extends object>(port: MessagePort, timeoutMs = 15_000) {
  let seq = 0
  const pending = new Map<number, { res: (v: any) => void; rej: (e: any) => void; t: number }>()

  port.onmessage = (ev: MessageEvent<RpcRes>) => {
    const m = ev.data
    if (!m || m.t !== 'resp') return
    const p = pending.get(m.id)
    if (!p) return
    clearTimeout(p.t)
    pending.delete(m.id)
    if (m.ok) p.res(m.r)
    else p.rej(new Error(m.e))
  }

  const call = (method: string, ...args: any[]) =>
    new Promise((res, rej) => {
      const id = ++seq
      const timer = window.setTimeout(() => {
        pending.delete(id)
        rej(new Error(`RPC timeout: ${method}`))
      }, timeoutMs)
      pending.set(id, { res, rej, t: timer })
      const msg: RpcReq = { t: 'call', id, m: method, a: args }
      port.postMessage(msg)
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
      port.close()
      pending.forEach((p) => clearTimeout(p.t))
      pending.clear()
    },
  }
}

function createRpcServer(port: MessagePort, registry: Record<string, AnyFn>) {
  port.onmessage = async (ev: MessageEvent<RpcReq>) => {
    const m = ev.data
    if (!m || m.t !== 'call') return
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
  }
  return { close: () => port.close() }
}

/* ---------- Public API contracts ---------- */

export interface SdkCapabilities {
  protocolVersion: string
  sdkVersion: string
  methods: string[]
}

export interface SdkApi {
  getConfigurationSnapshot(): Promise<{ data: Record<string, unknown>; functionKeys: string[] }>
  invokeConfigFunction(path: string, ...args: any[]): Promise<any>
  trackEvent(event: Record<string, unknown>): Promise<void>
  getCapabilities(): Promise<SdkCapabilities>
}

export interface AppApi {
  tryOn(productId: string): Promise<void>
}

/* ---------- Base ---------- */

abstract class AiutaRpcBase<
  TLocalHandlers extends Record<string, AnyFn>,
  TRemoteApi extends object,
  TContext extends object,
> {
  protected _client?: ReturnType<typeof createRpcClient<TRemoteApi>>
  protected _supports = new Set<string>()
  protected _context: TContext
  protected _handlers: TLocalHandlers

  constructor(opts: { context: TContext; handlers: TLocalHandlers }) {
    this._context = opts.context
    this._handlers = opts.handlers
  }

  protected buildRegistry(extra?: Record<string, AnyFn>): Record<string, AnyFn> {
    return { ...this._handlers, ...(extra ?? {}) }
  }

  supports(methodName: keyof TRemoteApi | string) {
    return this._supports.has(String(methodName))
  }

  close() {
    this._client?.close()
  }
}

/* ---------- SDK ---------- */

type SdkHandlers = {
  trackEvent?: (
    event: Record<string, unknown>,
    ctx: { appVersion?: string },
  ) => void | Promise<void>
}
type SdkContext = { cfg: AiutaConfiguration; sdkVersion: string }

export class AiutaRpcSDK extends AiutaRpcBase<SdkHandlers, AppApi, SdkContext> {
  private appClient?: ReturnType<typeof createRpcClient<AppApi>>
  private appVersion?: string

  async connect(iframeEl: HTMLIFrameElement): Promise<this> {
    if (!iframeEl.contentWindow) throw new Error('Iframe has no contentWindow')

    const ch = new MessageChannel()
    const port1 = ch.port1
    const port2 = ch.port2

    await new Promise<void>((resolve) => {
      const onMsg = (e: MessageEvent) => {
        if (e.source !== iframeEl.contentWindow) return
        const d = e.data as { type: 'app:hello'; nonce: string; appVersion?: string } | any
        if (!d || d.type !== 'app:hello') return
        this.appVersion = d.appVersion

        const extra: Record<string, AnyFn> = {
          getConfigurationSnapshot: async () => ({
            data: jsonSafeClone(this._context.cfg),
            functionKeys: extractFunctionPaths(this._context.cfg),
          }),
          invokeConfigFunction: async (path: string, ...args: any[]) => {
            const parts = path.split('.')
            let cur: any = this._context.cfg
            for (const p of parts) cur = cur?.[p]
            if (typeof cur !== 'function') throw new Error(`Config function not found: ${path}`)
            return await cur(...args)
          },
          getCapabilities: async (): Promise<SdkCapabilities> => ({
            protocolVersion: PROTOCOL_VERSION,
            sdkVersion: this._context.sdkVersion,
            methods: Object.keys(registry),
          }),
        }

        const registry = this.buildRegistry({
          ...extra,
          trackEvent: (event: Record<string, unknown>) =>
            this._handlers.trackEvent?.(event, { appVersion: this.appVersion }),
        })
        const methods = Object.keys(registry)

        const ack = {
          type: 'sdk:ack',
          nonce: d.nonce,
          version: PROTOCOL_VERSION,
          sdkVersion: this._context.sdkVersion,
          methods,
        }
        iframeEl.contentWindow!.postMessage(ack, e.origin, [port2])

        createRpcServer(port1, registry)
        this.appClient = createRpcClient<AppApi>(port1)

        window.removeEventListener('message', onMsg)
        resolve()
      }
      window.addEventListener('message', onMsg)
    })

    return this
  }

  get app() {
    if (!this.appClient) throw new Error('AiutaRpcSDK: not connected')
    return this.appClient.api
  }
}

/* ---------- APP ---------- */

type AppHandlers = { tryOn: (productId: string) => Promise<void> | void }
type AppContext = { appVersion: string }

export class AiutaRpcApp extends AiutaRpcBase<AppHandlers, SdkApi, AppContext> {
  sdk!: SdkApi
  config!: AiutaConfiguration
  sdkInfo!: { protocolVersion: string; sdkVersion: string }

  async connect(): Promise<this> {
    const nonce = rand()
    const { port, sdkVersion, methodsFromAck } = await new Promise<{
      port: MessagePort
      sdkVersion: string
      methodsFromAck?: string[]
    }>((resolve, reject) => {
      const onMsg = (e: MessageEvent) => {
        const d = e.data as
          | { type: 'sdk:ack'; nonce: string; sdkVersion?: string; methods?: string[] }
          | any
        if (!d || d.type !== 'sdk:ack') return
        if (d.nonce !== nonce) return
        const p = e.ports?.[0]
        if (!p) {
          reject(new Error('No port'))
          return
        }
        window.removeEventListener('message', onMsg)
        resolve({ port: p, sdkVersion: d.sdkVersion ?? 'unknown', methodsFromAck: d.methods })
      }
      window.addEventListener('message', onMsg)
      window.parent.postMessage(
        {
          type: 'app:hello',
          nonce,
          version: PROTOCOL_VERSION,
          appVersion: this._context.appVersion,
        },
        '*',
      )
    })

    createRpcServer(port, this.buildRegistry())
    this._client = createRpcClient<SdkApi>(port)
    this.sdk = this._client.api

    this.sdkInfo = { protocolVersion: PROTOCOL_VERSION, sdkVersion }
    this._supports = new Set(methodsFromAck ?? [])

    const snap = await this.sdk.getConfigurationSnapshot()
    const cfg = jsonSafeClone(snap.data) as AiutaConfiguration
    for (const path of snap.functionKeys) {
      setByPath(cfg as any, path, (...args: any[]) => this.sdk.invokeConfigFunction(path, ...args))
    }
    this.config = cfg

    return this
  }
}

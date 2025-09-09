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

function jsonSafeClone<T>(v: T): T | null {
  try {
    return JSON.parse(JSON.stringify(v ?? null))
  } catch (error) {
    console.warn('JSON serialization failed:', error)
    return null
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
  let isClosed = false
  const pending = new Map<number, { res: (v: any) => void; rej: (e: any) => void; t: number }>()

  port.onmessage = (ev: MessageEvent<RpcRes>) => {
    if (isClosed) return
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
    // Override in subclasses for additional cleanup
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
  private expectedIframeOrigin?: string
  private handshakeListener?: (event: MessageEvent) => void

  async connect(iframeEl: HTMLIFrameElement, expectedIframeOrigin?: string): Promise<this> {
    if (!iframeEl.contentWindow) throw new Error('Iframe has no contentWindow')

    this.expectedIframeOrigin = expectedIframeOrigin || this.inferIframeOrigin(iframeEl)
    if (!this.expectedIframeOrigin) {
      throw new Error('Unable to determine expected iframe origin')
    }

    const ch = new MessageChannel()
    const port1 = ch.port1
    const port2 = ch.port2

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
        }
        reject(new Error('SDK handshake timeout'))
      }, 10000)

      this.handshakeListener = (e: MessageEvent) => {
        // Validate source and origin
        if (e.source !== iframeEl.contentWindow) return
        if (e.origin !== this.expectedIframeOrigin) {
          console.warn(
            `Rejected handshake from unexpected origin: ${e.origin}, expected: ${this.expectedIframeOrigin}`,
          )
          return
        }

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

        try {
          iframeEl.contentWindow!.postMessage(ack, this.expectedIframeOrigin!, [port2])
        } catch (error) {
          clearTimeout(timeout)
          reject(new Error(`Failed to send handshake ack: ${error}`))
          return
        }

        createRpcServer(port1, registry)
        this.appClient = createRpcClient<AppApi>(port1)

        clearTimeout(timeout)
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
          this.handshakeListener = undefined
        }
        resolve()
      }
      window.addEventListener('message', this.handshakeListener)
    })

    return this
  }

  private inferIframeOrigin(iframeEl: HTMLIFrameElement): string | undefined {
    try {
      const iframeSrc = iframeEl.src
      if (iframeSrc) {
        const url = new URL(iframeSrc)
        return url.origin
      }
    } catch (error) {
      console.warn('Failed to infer iframe origin:', error)
    }
    return undefined
  }

  get app() {
    if (!this.appClient) throw new Error('AiutaRpcSDK: not connected')
    return this.appClient.api
  }

  close() {
    super.close()
    if (this.handshakeListener) {
      window.removeEventListener('message', this.handshakeListener)
      this.handshakeListener = undefined
    }
    this.appClient?.close()
    this.appClient = undefined
  }
}

/* ---------- APP ---------- */

type AppHandlers = { tryOn: (productId: string) => Promise<void> | void }
type AppContext = { appVersion: string }

export class AiutaRpcApp extends AiutaRpcBase<AppHandlers, SdkApi, AppContext> {
  sdk!: SdkApi
  config!: AiutaConfiguration
  sdkInfo!: { protocolVersion: string; sdkVersion: string }
  private expectedParentOrigin?: string
  private handshakeListener?: (event: MessageEvent) => void

  async connect(): Promise<this> {
    // 1. Get expected parent origin from URL parameters
    this.expectedParentOrigin = this.getExpectedParentOriginFromUrl()

    // 2. Perform secure handshake with origin validation
    const { port, sdkVersion, methodsFromAck } = await this.performSecureHandshake()

    // 3. Setup RPC connection
    createRpcServer(port, this.buildRegistry())
    this._client = createRpcClient<SdkApi>(port)
    this.sdk = this._client.api

    this.sdkInfo = { protocolVersion: PROTOCOL_VERSION, sdkVersion }
    this._supports = new Set(methodsFromAck ?? [])

    const snap = await this.sdk.getConfigurationSnapshot()
    const cfg = jsonSafeClone(snap.data) as AiutaConfiguration | null
    if (!cfg) {
      throw new Error('Failed to clone configuration data')
    }

    for (const path of snap.functionKeys) {
      setByPath(cfg as any, path, (...args: any[]) => this.sdk.invokeConfigFunction(path, ...args))
    }
    this.config = cfg

    return this
  }

  private getExpectedParentOriginFromUrl(): string {
    const urlParams = new URLSearchParams(window.location.search)
    const parentOrigin = urlParams.get('parentOrigin')

    if (!parentOrigin) {
      throw new Error('parentOrigin parameter is required in iframe URL')
    }

    try {
      return new URL(parentOrigin).origin
    } catch {
      throw new Error(`Invalid parentOrigin format: ${parentOrigin}`)
    }
  }

  private async performSecureHandshake(): Promise<{
    port: MessagePort
    sdkVersion: string
    methodsFromAck?: string[]
  }> {
    const nonce = rand()

    return new Promise<{
      port: MessagePort
      sdkVersion: string
      methodsFromAck?: string[]
    }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
        }
        reject(new Error('App handshake timeout'))
      }, 10000)

      this.handshakeListener = (e: MessageEvent) => {
        // Validate origin
        if (e.origin !== this.expectedParentOrigin) {
          console.warn(
            `Rejected handshake from unexpected origin: ${e.origin}, expected: ${this.expectedParentOrigin}`,
          )
          return
        }

        const d = e.data as
          | { type: 'sdk:ack'; nonce: string; sdkVersion?: string; methods?: string[] }
          | any
        if (!d || d.type !== 'sdk:ack') return
        if (d.nonce !== nonce) return

        const p = e.ports?.[0]
        if (!p) {
          clearTimeout(timeout)
          reject(new Error('No port in handshake response'))
          return
        }

        clearTimeout(timeout)
        if (this.handshakeListener) {
          window.removeEventListener('message', this.handshakeListener)
          this.handshakeListener = undefined
        }
        resolve({ port: p, sdkVersion: d.sdkVersion ?? 'unknown', methodsFromAck: d.methods })
      }

      window.addEventListener('message', this.handshakeListener)

      try {
        window.parent.postMessage(
          {
            type: 'app:hello',
            nonce,
            version: PROTOCOL_VERSION,
            appVersion: this._context.appVersion,
          },
          this.expectedParentOrigin!,
        )
      } catch (error) {
        clearTimeout(timeout)
        reject(new Error(`Failed to send handshake: ${error}`))
      }
    })
  }

  close() {
    super.close()
    if (this.handshakeListener) {
      window.removeEventListener('message', this.handshakeListener)
      this.handshakeListener = undefined
    }
  }
}

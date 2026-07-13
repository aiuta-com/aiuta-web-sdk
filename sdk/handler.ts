import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaSdkRpc } from '@lib/rpc'
import type { SdkApi, SdkContext } from '@lib/rpc'
import type { AiutaConfiguration, AiutaMode } from '@lib/config'
import type { SizeFitRequestOptions } from '@lib/rpc'
import type { Logger } from '@lib/logger'

declare const __SDK_VERSION__: string

/** The latest open request; rapid calls coalesce so only the last one wins. */
type PendingOpen =
  | {
      kind: 'tryOn'
      productIds: string[]
      mode: AiutaMode
      gender?: string
      sizeFit?: SizeFitRequestOptions
    }
  | { kind: 'sizeFit'; productId: string; sizeFit: SizeFitRequestOptions }

export default class MessageHandler {
  private rpc: AiutaSdkRpc<AiutaConfiguration>
  // De-dupes concurrent connects: rapid repeated tryOn calls before the
  // handshake completes must await the same connection, not start new ones
  private connecting?: Promise<void>
  // Coalesces rapid open calls: only the latest request is forwarded to the app
  private pendingOpen?: PendingOpen
  private openRunning = false

  constructor(
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
    private readonly logger: Logger,
  ) {
    const handlers: SdkApi = {
      trackEvent: (event) => {
        this.analytics.track(event)
      },
      setInteractive: (interactive) => {
        this.iframeManager.setInteractive(interactive)
      },
    }

    const context: SdkContext<AiutaConfiguration> = {
      config: this.configuration,
      sdkVersion: __SDK_VERSION__,
    }

    this.rpc = new AiutaSdkRpc<AiutaConfiguration>({
      context,
      handlers,
    })
  }

  async startTryOn(
    productIds: string[],
    mode: AiutaMode,
    gender?: string,
    sizeFit?: SizeFitRequestOptions,
  ) {
    await this.open({ kind: 'tryOn', productIds, mode, gender, sizeFit })
  }

  async startSizeFit(productId: string, sizeFit: SizeFitRequestOptions) {
    await this.open({ kind: 'sizeFit', productId, sizeFit })
  }

  private async open(request: PendingOpen) {
    // Always record the latest request. If a run is already in flight, it will
    // pick this up — only the most recent open reaches the app.
    this.pendingOpen = request
    if (this.openRunning) return

    this.openRunning = true
    try {
      const iframe = this.iframeManager.getIframe()
      if (!iframe) return

      // The overlay may still be display:none from the previous close (or a
      // host page's own shielding) — restore rendering BEFORE the app opens,
      // or Chromium skips the slide-in and stalls lazy images (see
      // IframeManager.prepareShow).
      this.iframeManager.prepareShow()

      await this.ensureConnected(iframe)

      // Drain to the latest pending request (more may have arrived during the
      // connect / the previous send), so the app always ends on the last one.
      while (this.pendingOpen) {
        const next = this.pendingOpen
        this.pendingOpen = undefined
        if (next.kind === 'tryOn') {
          const options =
            next.gender || next.sizeFit ? { gender: next.gender, sizeFit: next.sizeFit } : undefined
          await this.rpc.app.tryOn(next.productIds, next.mode, options)
        } else {
          await this.rpc.app.sizeFit(next.productId, next.sizeFit)
        }
      }
    } catch (error) {
      this.logger.error(`Aiuta RPC ${request.kind} failed:`, error)
      this.analytics.track({ type: 'session', event: 'rpcFailed' })
    } finally {
      this.openRunning = false
    }
  }

  async clearStorage() {
    const iframe = this.iframeManager.getIframe()
    if (!iframe) return

    // No catch: an older app without the handler rejects with
    // "Unknown method" — let the caller see the failure
    await this.ensureConnected(iframe)
    await this.rpc.app.clearStorage()
  }

  private async ensureConnected(iframe: HTMLIFrameElement) {
    if (this.rpc.isConnected()) return

    // Reuse an in-flight connection so concurrent callers don't open parallel
    // handshakes (which would race over the message port and break RPC). On
    // failure the promise is cleared so a later call can retry.
    if (!this.connecting) {
      this.connecting = this.connect(iframe).finally(() => {
        this.connecting = undefined
      })
    }

    await this.connecting
  }

  private async connect(iframe: HTMLIFrameElement) {
    await this.rpc.connect(iframe)

    if (this.rpc.context.appVersion) {
      this.analytics.setIframeVersion(this.rpc.context.appVersion)
    }

    this.analytics.track({ type: 'session', event: 'iframeLoaded' })
  }
}

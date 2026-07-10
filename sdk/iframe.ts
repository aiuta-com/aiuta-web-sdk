import type { AiutaConfiguration } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __APP_URL__: string

/**
 * How long to keep the overlay rendered after it becomes non-interactive, so the
 * app's closing animation can play out before the iframe is hidden. Must be >=
 * the AppContainer slide-out (`transition: all ease-in-out 0.2s`).
 */
const OVERLAY_HIDE_DELAY_MS = 250

export default class IframeManager {
  private readonly iframeId = 'aiuta-iframe'

  private iframeUrl: string
  private iframe: HTMLIFrameElement | null = null
  private customCssUrl?: string
  private hasDebugIframe = false
  private hideTimer: ReturnType<typeof setTimeout> | null = null
  private creating: Promise<void> | null = null

  constructor(
    configuration: AiutaConfiguration,
    private readonly logger: Logger,
  ) {
    // Use debug URL if provided, otherwise use built-in URL
    if (
      configuration.debugSettings?.iframeAppUrl &&
      configuration.debugSettings.iframeAppUrl !== __APP_URL__
    ) {
      this.iframeUrl = configuration.debugSettings.iframeAppUrl
      this.hasDebugIframe = true
    } else {
      this.iframeUrl = __APP_URL__
    }

    if (configuration.userInterface?.theme?.customCssUrl) {
      this.customCssUrl = configuration.userInterface.theme.customCssUrl
    }
  }

  getIframe = () => this.iframe

  async ensureIframe() {
    const existing = document.getElementById(this.iframeId) as HTMLIFrameElement | null
    if (existing) {
      this.iframe = existing
      return
    }
    // Guard against concurrent calls (preload + an early tryOn) creating the
    // iframe twice while createIframe is still awaiting (debug URL check).
    if (!this.creating) {
      this.creating = this.createIframe().finally(() => {
        this.creating = null
      })
    }
    await this.creating
  }

  /** Bring the iframe back into rendering BEFORE the app starts its opening
   *  flow. A display:none'd iframe doesn't render in Chromium — rAF doesn't
   *  tick, CSS transitions skip to their end state and lazy images have no
   *  geometry to intersect — so an opening staged there pops in with no
   *  slide-in (and image loaders mis-fire). Visibility stays as it is: the
   *  app flips it via setInteractive(true) when it actually shows, exactly
   *  the pre-display:none sequence that worked everywhere. Also cancels a
   *  pending idle-hide from a close still in flight, so it can't display-hide
   *  the iframe mid-reopen. */
  prepareShow() {
    const iframe = this.iframe
    if (!iframe) return
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    if (iframe.style.display === 'none') {
      iframe.style.display = ''
      // Flush the restored display so the app's very first animation frame
      // has a rendered iframe to paint into.
      void iframe.getBoundingClientRect()
    }
  }

  setInteractive(interactive: boolean) {
    const iframe = this.iframe
    if (!iframe) return

    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }

    iframe.style.pointerEvents = interactive ? 'auto' : 'none'

    if (interactive) {
      iframe.style.visibility = 'visible'
      // Also undo display:none — ours (set below once hidden) or a host's:
      // pages shield the idle overlay from drag-and-drop hit-testing by
      // display-hiding it, and a try-on must recover even if the host never
      // restored it.
      iframe.style.display = ''
    } else {
      // Keep the overlay rendered through the app's closing animation, then drop
      // it out of hit-testing. A lingering full-screen pointer-events:none iframe
      // still captures wheel/scroll in Safari, breaking the host page's
      // scrollers — and Chromium keeps routing drag-and-drop hit-testing into it
      // even under visibility:hidden, so it leaves layout entirely.
      this.hideTimer = setTimeout(() => {
        this.hideTimer = null
        if (this.iframe && this.iframe.style.pointerEvents === 'none') {
          this.iframe.style.visibility = 'hidden'
          this.iframe.style.display = 'none'
        }
      }, OVERLAY_HIDE_DELAY_MS)
    }
  }

  removeIframe() {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    // Always search in DOM by id (handles both this.iframe and orphaned iframes)
    const iframeInDom = document.getElementById(this.iframeId)
    if (iframeInDom) {
      iframeInDom.remove()
      this.logger.debug('Aiuta iframe removed')
    }
    this.iframe = null
  }

  private async createIframe() {
    // Check debug URL availability before creating iframe
    if (this.hasDebugIframe) {
      const isAvailable = await this.checkUrlAvailability(this.iframeUrl)
      if (!isAvailable) {
        this.logger.warn(
          `Debug iframe URL ${this.iframeUrl} is not available, falling back to default URL`,
        )
        this.hasDebugIframe = false
        this.iframeUrl = __APP_URL__
      }
    }

    const src = this.buildIframeSrc()
    const iframe = document.createElement('iframe') as HTMLIFrameElement
    iframe.id = this.iframeId
    iframe.src = src
    // autoplay must be delegated explicitly: its permission-policy allowlist
    // defaults to `self`, so a cross-origin app iframe (SDK loaded from the CDN
    // on a partner page) can't muted-autoplay the onboarding video without it
    iframe.allow = 'clipboard-write; web-share; autoplay'

    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.width = '100vw'
    iframe.style.width = '100dvw'
    iframe.style.height = '100vh'
    iframe.style.height = '100dvh'
    iframe.style.zIndex = '10000'
    iframe.style.border = 'none'
    iframe.style.background = 'transparent'
    iframe.style.pointerEvents = 'none'
    // Start hidden until the app shows itself (setInteractive(true)); see setInteractive.
    iframe.style.visibility = 'hidden'

    document.body.append(iframe)
    this.iframe = iframe

    this.logger.debug('Aiuta iframe created', src)
  }

  private buildIframeSrc() {
    const absoluteUrl = this.iframeUrl.startsWith('/')
      ? `${window.location.origin}${this.iframeUrl}`
      : this.iframeUrl
    const url = new URL(absoluteUrl)
    url.searchParams.set('parentOrigin', window.location.origin)

    if (this.customCssUrl) {
      let resolvedCssUrl = this.customCssUrl
      if (!this.customCssUrl.startsWith('http')) {
        try {
          resolvedCssUrl = new URL(this.customCssUrl, window.location.origin).href
        } catch {
          const origin = window.location.origin
          resolvedCssUrl = this.customCssUrl.startsWith('/')
            ? `${origin}${this.customCssUrl}`
            : `${origin}/${this.customCssUrl}`
        }
      }
      url.searchParams.set('css', resolvedCssUrl)
    }

    return url.toString()
  }

  private async checkUrlAvailability(url: string): Promise<boolean> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1000)

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        return true
      }

      this.logger.debug(`URL returned status ${response.status} for ${url}`)
      return false
    } catch (error) {
      clearTimeout(timeoutId)
      this.logger.debug(`URL availability check failed for ${url}:`, error)
      return false
    }
  }
}

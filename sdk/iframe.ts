import type { AiutaConfiguration } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __APP_URL__: string

export default class IframeManager {
  private readonly iframeId = 'aiuta-iframe'

  private iframeUrl: string
  private iframe: HTMLIFrameElement | null = null
  private customCssUrl?: string
  private hasDebugIframe = false

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
    } else {
      await this.createIframe()
    }
  }

  setInteractive(interactive: boolean) {
    const iframe = this.iframe
    if (!iframe) return

    iframe.style.pointerEvents = interactive ? 'auto' : 'none'
  }

  removeIframe() {
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
    iframe.allow = 'clipboard-write; web-share'

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

import type { AiutaUserInterface } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __APP_URL__: string

export default class IframeManager {
  private readonly iframeId = 'aiuta-iframe'
  private readonly iframeUrl = __APP_URL__

  private iframe: HTMLIFrameElement | null = null
  private customCssUrl?: string

  constructor(
    userInterface: AiutaUserInterface | undefined,
    private readonly logger: Logger,
  ) {
    if (userInterface?.theme?.customCssUrl) {
      this.customCssUrl = userInterface.theme.customCssUrl
    }
  }

  getIframe = () => this.iframe

  ensureIframe() {
    const existing = document.getElementById(this.iframeId) as HTMLIFrameElement | null
    if (existing) {
      this.iframe = existing
    } else {
      this.createIframe()
    }
  }

  setInteractive(interactive: boolean) {
    const iframe = this.iframe
    if (!iframe) return

    iframe.style.pointerEvents = interactive ? 'auto' : 'none'
  }

  private createIframe() {
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
}

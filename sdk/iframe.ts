// TODO: Replace with RPC - need to support sending modal actions to iframe
// Required actions: openFullScreenModal, openShareModal
import type { FullScreenModalData, FullscreenModalIframeConfig, ShareModalData } from './types'
import type { AiutaUserInterface } from '@lib/config'
import type { Logger } from '@lib/logger'

declare const __APP_URL__: string

// Default iframe styles and dimensions
const iframeDefaults = {
  // Desktop dimensions
  desktopWidth: '394px',
  desktopHeight: '632px',

  // Positioning
  defaultTop: '12px',
  defaultRight: '12px',
  hiddenRight: '-50%',

  // Fullscreen positioning (used for mobile and modals)
  fullscreenTop: '0px',
  fullscreenRight: '0px',
  fullscreenLeft: '0px',
  fullscreenBottom: '0px',
  fullscreenWidth: '100%',
  fullscreenHeight: '100%',

  // Styling
  defaultBorderRadius: '24px',
  defaultBorder: '1px solid #0000001A',
  defaultBoxShadow: '0px 8px 28px -6px #0000001F',
  defaultTransition: 'all ease-in-out 0.3s',

  // Mobile overrides
  mobileBorderRadius: '0px',
  mobileBorder: '1px solid #ffffff',
  mobileBoxShadow: 'none',

  // Other
  zIndex: '10000',
  fullscreenModalZIndex: '10001',
  shareModalZIndex: '10002',
  mobileBreakpoint: 992,

  // Modal styles
  modalBorder: 'none',
  modalBackground: 'transparent',

  // HTML attributes
  iframeId: 'aiuta-iframe',
  fullscreenModalId: 'aiuta-fullscreen-modal',
  shareModalId: 'aiuta-share-modal',
  allowAttribute: 'fullscreen',
  position: 'fixed',
} as const

export default class IframeManager {
  private iframe: HTMLIFrameElement | null = null
  private isOpen = false
  private fullscreenModalIframe: HTMLIFrameElement | null = null
  private shareModalIframe: HTMLIFrameElement | null = null

  customCssUrl?: string
  iframeStyles?: AiutaUserInterface['iframeStyles']

  constructor(
    userInterface: AiutaUserInterface | undefined,
    private readonly logger: Logger,
  ) {
    if (userInterface) this.applyUserInterface(userInterface)
  }

  private get iframeUrl() {
    return __APP_URL__
  }

  private resolveIframeOrigin(iframeUrl: string) {
    if (iframeUrl.startsWith('/')) return window.location.origin
    const url = new URL(iframeUrl)
    return `${url.protocol}//${url.host}`
  }

  getIframeOrigin() {
    return this.resolveIframeOrigin(this.iframeUrl)
  }

  private applyUserInterface(userInterface: AiutaUserInterface) {
    if (userInterface.customCssUrl) this.customCssUrl = userInterface.customCssUrl
    if (userInterface.iframeStyles) this.iframeStyles = userInterface.iframeStyles
  }

  getIframe = () => this.iframe
  getIsOpen = () => this.isOpen

  showMainFrame() {
    const existing = document.getElementById(iframeDefaults.iframeId) as HTMLIFrameElement | null
    if (existing) {
      this.logger.debug('Revealing existing iframe')
      this.reveal()
    } else {
      this.logger.debug('Creating new main iframe')
      this.createMainIframe()
    }
  }

  private buildIframeSrc(baseUrl: string, customCssUrl?: string) {
    const absoluteUrl = baseUrl.startsWith('/') ? `${window.location.origin}${baseUrl}` : baseUrl
    const url = new URL(absoluteUrl)
    url.searchParams.set('parentOrigin', window.location.origin)

    if (customCssUrl) {
      let resolvedCssUrl = customCssUrl
      if (!customCssUrl.startsWith('http')) {
        try {
          resolvedCssUrl = new URL(customCssUrl, window.location.origin).href
        } catch {
          const origin = window.location.origin
          resolvedCssUrl = customCssUrl.startsWith('/')
            ? `${origin}${customCssUrl}`
            : `${origin}/${customCssUrl}`
        }
      }
      url.searchParams.set('css', resolvedCssUrl)
    }

    return url.toString()
  }

  createMainIframe() {
    const src = this.buildIframeSrc(this.iframeUrl, this.customCssUrl)
    const iframe = document.createElement('iframe') as HTMLIFrameElement
    iframe.id = iframeDefaults.iframeId
    iframe.allow = iframeDefaults.allowAttribute
    iframe.src = src

    // Apply styles with fallbacks to defaults
    iframe.style.position = iframeDefaults.position
    iframe.style.width = iframeDefaults.desktopWidth
    iframe.style.height = iframeDefaults.desktopHeight
    iframe.style.zIndex = iframeDefaults.zIndex
    iframe.style.border = this.iframeStyles?.border ?? iframeDefaults.defaultBorder
    iframe.style.borderRadius =
      this.iframeStyles?.borderRadius ?? iframeDefaults.defaultBorderRadius
    iframe.style.boxShadow = this.iframeStyles?.boxShadow ?? iframeDefaults.defaultBoxShadow
    iframe.style.transition = this.iframeStyles?.transition ?? iframeDefaults.defaultTransition
    iframe.style.top = this.iframeStyles?.top ?? iframeDefaults.defaultTop
    iframe.style.right = iframeDefaults.hiddenRight // Always start hidden, ignore custom right

    document.body.append(iframe)
    this.iframe = iframe

    iframe.addEventListener('load', () => {
      this.reveal()
    })

    window.addEventListener('resize', () => {
      this.adjustForViewport()
    })
  }

  reveal() {
    const iframe = this.iframe
    if (!iframe) return
    this.isOpen = true
    this.adjustForViewport()
    if (window.innerWidth <= iframeDefaults.mobileBreakpoint) {
      iframe.style.right = iframeDefaults.fullscreenRight
    } else {
      iframe.style.right = this.iframeStyles?.right ?? iframeDefaults.defaultRight
    }
  }

  hide() {
    const iframe = this.iframe
    if (!iframe) return
    this.isOpen = false
    iframe.style.right = iframeDefaults.hiddenRight
  }

  adjustForViewport() {
    const iframe = this.iframe
    if (!iframe || !this.isOpen) return
    if (window.innerWidth <= iframeDefaults.mobileBreakpoint) {
      iframe.style.width = iframeDefaults.fullscreenWidth
      iframe.style.height = iframeDefaults.fullscreenHeight
      iframe.style.borderRadius = iframeDefaults.mobileBorderRadius
      iframe.style.border = iframeDefaults.mobileBorder
      iframe.style.boxShadow = iframeDefaults.mobileBoxShadow
      iframe.style.top = iframeDefaults.fullscreenTop
      iframe.style.right = iframeDefaults.fullscreenRight
    } else {
      iframe.style.width = iframeDefaults.desktopWidth
      iframe.style.height = iframeDefaults.desktopHeight
      iframe.style.borderRadius =
        this.iframeStyles?.borderRadius ?? iframeDefaults.defaultBorderRadius
      iframe.style.border = this.iframeStyles?.border ?? iframeDefaults.defaultBorder
      iframe.style.boxShadow = this.iframeStyles?.boxShadow ?? iframeDefaults.defaultBoxShadow
      iframe.style.top = this.iframeStyles?.top ?? iframeDefaults.defaultTop
      iframe.style.right = this.iframeStyles?.right ?? iframeDefaults.defaultRight
    }
  }

  openFullscreenModal(modalData: FullScreenModalData) {
    this.logger.debug('Opening fullscreen modal:', modalData)
    this.removeFullscreenModal()
    const modalUrl = this.buildModalUrl('fullscreen')
    const cfg: FullscreenModalIframeConfig = {
      id: iframeDefaults.fullscreenModalId,
      src: modalUrl.toString(),
      styles: {
        position: iframeDefaults.position,
        top: iframeDefaults.fullscreenTop,
        left: iframeDefaults.fullscreenLeft,
        width: iframeDefaults.fullscreenWidth,
        height: iframeDefaults.fullscreenHeight,
        zIndex: iframeDefaults.fullscreenModalZIndex,
        border: iframeDefaults.modalBorder,
        background: iframeDefaults.modalBackground,
      },
      allow: 'fullscreen',
    }
    const iframe = this.createOverlayIframe(cfg)
    document.body.appendChild(iframe)
    this.fullscreenModalIframe = iframe
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        this.fullscreenModalIframe?.contentWindow?.postMessage(
          // TODO: Replace with RPC call
          { action: 'OPEN_AIUTA_FULL_SCREEN_MODAL', data: modalData },
          this.getIframeOrigin(),
        )
      }, 100)
    })
  }

  removeFullscreenModal() {
    if (this.fullscreenModalIframe) {
      this.fullscreenModalIframe.remove()
      this.fullscreenModalIframe = null
    }
  }

  openShareModal(shareData: ShareModalData) {
    this.logger.debug('Opening share modal:', shareData)
    this.removeShareModal()
    const modalUrl = this.buildModalUrl('share')
    const cfg: FullscreenModalIframeConfig = {
      id: iframeDefaults.shareModalId,
      src: modalUrl.toString(),
      styles: {
        position: iframeDefaults.position,
        top: iframeDefaults.fullscreenTop,
        left: iframeDefaults.fullscreenLeft,
        width: iframeDefaults.fullscreenWidth,
        height: iframeDefaults.fullscreenHeight,
        zIndex: iframeDefaults.shareModalZIndex,
        border: iframeDefaults.modalBorder,
        background: iframeDefaults.modalBackground,
      },
      allow: 'fullscreen',
    }
    const iframe = this.createOverlayIframe(cfg)
    document.body.appendChild(iframe)
    this.shareModalIframe = iframe
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        this.shareModalIframe?.contentWindow?.postMessage(
          // TODO: Replace with RPC call
          { action: 'OPEN_AIUTA_SHARE_MODAL', data: shareData },
          this.getIframeOrigin(),
        )
      }, 100)
    })
  }

  removeShareModal() {
    if (this.shareModalIframe) {
      this.shareModalIframe.remove()
      this.shareModalIframe = null
    }
  }

  closeOrHide() {
    if (this.fullscreenModalIframe) {
      this.removeFullscreenModal()
      return
    }
    if (this.shareModalIframe) {
      this.removeShareModal()
      return
    }
    if (!this.iframe) return
    this.isOpen = false
    this.hide()
  }

  private buildModalUrl(modalType: 'fullscreen' | 'share') {
    const baseUrl = window.location.origin
    const absoluteIframeUrl = this.iframeUrl.startsWith('http')
      ? this.iframeUrl
      : `${baseUrl}${this.iframeUrl}`
    const url = new URL(absoluteIframeUrl)
    url.searchParams.set('modal', 'true')
    url.searchParams.set('modalType', modalType)
    url.searchParams.set('parentOrigin', window.location.origin)
    return url
  }

  private createOverlayIframe(config: FullscreenModalIframeConfig) {
    const iframe = document.createElement('iframe')
    iframe.id = config.id
    iframe.src = config.src
    iframe.allow = config.allow
    Object.assign(iframe.style, config.styles)
    return iframe
  }
}

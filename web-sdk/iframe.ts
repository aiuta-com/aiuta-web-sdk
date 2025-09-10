import { MESSAGE_ACTIONS } from '@shared/messaging'
import type { FullScreenModalData, FullscreenModalIframeConfig, ShareModalData } from './types'
import type {
  AiutaIframePosition,
  AiutaStylesConfiguration,
  AiutaUserInterface,
} from '@shared/config'
import { SDK_POSITION } from './constants'
import { INITIALLY_STYLES_CONFIGURATION } from '@shared/config'

declare const __AIUTA_IFRAME_URL__: string

export default class IframeManager {
  private iframe: HTMLIFrameElement | null = null
  private isOpen = false
  private originalIframeStyles: any = null
  private originalIframeParent: Element | null = null
  private fullscreenModalIframe: HTMLIFrameElement | null = null
  private shareModalIframe: HTMLIFrameElement | null = null

  position: AiutaIframePosition = 'topRight'
  stylesConfiguration: AiutaStylesConfiguration = INITIALLY_STYLES_CONFIGURATION
  customCssUrl?: string

  constructor(userInterface: AiutaUserInterface | undefined) {
    if (userInterface) this.applyUserInterface(userInterface)
  }

  private get iframeUrl() {
    return __AIUTA_IFRAME_URL__
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
    if (userInterface.position && userInterface.position.length > 0)
      this.position = userInterface.position
    if (userInterface.stylesConfiguration)
      this.stylesConfiguration = userInterface.stylesConfiguration
    if (userInterface.customCssUrl) this.customCssUrl = userInterface.customCssUrl
  }

  getIframe = () => this.iframe
  getIsOpen = () => this.isOpen

  showMainFrame() {
    const existing = document.getElementById('aiuta-iframe') as HTMLIFrameElement | null
    if (existing) this.reveal()
    else this.createMainIframe()
  }

  private buildIframeSrc(baseUrl: string, customCssUrl?: string) {
    let src = baseUrl.startsWith('/') ? `${window.location.origin}${baseUrl}` : baseUrl

    // Add parentOrigin parameter for RPC security
    const parentOrigin = window.location.origin
    const sep1 = src.includes('?') ? '&' : '?'
    src = `${src}${sep1}parentOrigin=${encodeURIComponent(parentOrigin)}`

    if (!customCssUrl) return src
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
    const sep2 = '&' // src already has ? from parentOrigin
    return `${src}${sep2}css=${encodeURIComponent(resolvedCssUrl)}`
  }

  createMainIframe() {
    const src = this.buildIframeSrc(this.iframeUrl, this.customCssUrl)
    const iframe = document.createElement('iframe') as HTMLIFrameElement
    iframe.id = 'aiuta-iframe'
    iframe.allow = 'fullscreen'
    iframe.src = src
    iframe.style.transition = 'all ease-in-out 0.5s'
    iframe.style.position = 'fixed'
    iframe.style.width = '394px'
    iframe.style.height = '632px'
    iframe.style.borderRadius = '24px'
    iframe.style.zIndex = '9999'
    iframe.style.border = '1px solid #0000001A'
    iframe.style.boxShadow = '0px 8px 28px -6px #0000001F'
    switch (this.position) {
      case 'topLeft':
        iframe.style.top = SDK_POSITION.topLeft.top
        iframe.style.left = '-1000%'
        break
      case 'topRight':
        iframe.style.top = SDK_POSITION.topRight.top
        iframe.style.right = '-1000%'
        break
      case 'bottomLeft':
        iframe.style.bottom = SDK_POSITION.bottomLeft.bottom
        iframe.style.left = '-1000%'
        break
      case 'bottomRight':
        iframe.style.bottom = SDK_POSITION.bottomRight.bottom
        iframe.style.right = '-1000%'
        break
    }
    document.body.append(iframe)
    this.iframe = iframe
    setTimeout(() => this.reveal(), 1000)
    window.addEventListener('resize', () => {
      this.adjustForViewport()
    })
  }

  reveal() {
    const iframe = this.iframe
    if (!iframe) return
    this.isOpen = true
    this.adjustForViewport()
    if (window.innerWidth <= 992) {
      switch (this.position) {
        case 'topLeft':
        case 'bottomLeft':
          iframe.style.left = '0px'
          break
        case 'topRight':
        case 'bottomRight':
          iframe.style.right = '0px'
          break
      }
      if (document.body.parentElement) document.body.parentElement.style.overflow = 'hidden'
    } else {
      switch (this.position) {
        case 'topLeft':
          iframe.style.left = SDK_POSITION.topLeft.left
          break
        case 'topRight':
          iframe.style.right = SDK_POSITION.topRight.right
          break
        case 'bottomLeft':
          iframe.style.left = SDK_POSITION.bottomLeft.left
          break
        case 'bottomRight':
          iframe.style.right = SDK_POSITION.bottomRight.right
          break
      }
    }
  }

  hide() {
    const iframe = this.iframe
    if (!iframe) return
    this.isOpen = false
    switch (this.position) {
      case 'topLeft':
      case 'bottomLeft':
        iframe.style.left = '-1000%'
        break
      case 'topRight':
      case 'bottomRight':
        iframe.style.right = '-1000%'
        break
    }
  }

  adjustForViewport() {
    const iframe = this.iframe
    if (!iframe || !this.isOpen) return
    if (window.innerWidth <= 992) {
      iframe.style.width = '100%'
      iframe.style.height = '100%'
      iframe.style.borderRadius = '0px'
      iframe.style.border = '1px solid #ffffff'
      switch (this.position) {
        case 'topLeft':
          iframe.style.top = '0px'
          iframe.style.left = '0px'
          break
        case 'topRight':
          iframe.style.top = '0px'
          iframe.style.right = '0px'
          break
        case 'bottomLeft':
          iframe.style.left = '0px'
          iframe.style.bottom = '0px'
          break
        case 'bottomRight':
          iframe.style.right = '0px'
          iframe.style.bottom = '0px'
          break
      }
    } else {
      iframe.style.width = '394px'
      iframe.style.height = '632px'
      iframe.style.borderRadius = '24px'
      iframe.style.border = '1px solid #0000001A'
      switch (this.position) {
        case 'topLeft':
          iframe.style.top = SDK_POSITION.topLeft.top
          break
        case 'topRight':
          iframe.style.top = SDK_POSITION.topRight.top
          break
        case 'bottomLeft':
          iframe.style.bottom = SDK_POSITION.bottomLeft.bottom
          break
        case 'bottomRight':
          iframe.style.bottom = SDK_POSITION.bottomRight.bottom
          break
      }
    }
  }

  makeMainIframeFullscreen(modalData: any) {
    const iframe = this.iframe
    if (!iframe) return
    this.originalIframeStyles = {
      position: iframe.style.position,
      top: iframe.style.top,
      left: iframe.style.left,
      right: iframe.style.right,
      bottom: iframe.style.bottom,
      width: iframe.style.width,
      height: iframe.style.height,
      zIndex: iframe.style.zIndex,
      borderRadius: iframe.style.borderRadius,
      border: iframe.style.border,
      boxShadow: iframe.style.boxShadow,
    }
    this.originalIframeParent = iframe.parentElement
    if (iframe.parentElement && iframe.parentElement !== document.body) {
      document.body.appendChild(iframe)
    }
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.left = '0'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '100vw'
    iframe.style.height = '100vh'
    iframe.style.zIndex = '10000'
    iframe.style.borderRadius = '0'
    iframe.style.border = 'none'
    iframe.style.boxShadow = 'none'
    iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
    if (document.body.parentElement) document.body.parentElement.style.overflow = 'hidden'
    iframe.contentWindow?.postMessage(
      { action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL, data: modalData },
      this.getIframeOrigin(),
    )
  }

  restoreFromFullscreen() {
    const iframe = this.iframe
    if (!iframe) return
    if (this.originalIframeStyles) {
      Object.assign(iframe.style, this.originalIframeStyles)
      this.originalIframeStyles = null
    }
    if (this.originalIframeParent && this.originalIframeParent !== document.body) {
      this.originalIframeParent.appendChild(iframe)
    }
    this.originalIframeParent = null
    if (document.body.parentElement) document.body.parentElement.style.overflow = ''
  }

  openFullscreenModal(modalData: FullScreenModalData) {
    this.removeFullscreenModal()
    const modalUrl = this.buildModalUrl('fullscreen')
    const cfg: FullscreenModalIframeConfig = {
      id: 'aiuta-fullscreen-modal',
      src: modalUrl.toString(),
      styles: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '10001',
        border: 'none',
        background: 'transparent',
      },
      allow: 'fullscreen',
    }
    const iframe = this.createOverlayIframe(cfg)
    document.body.appendChild(iframe)
    this.fullscreenModalIframe = iframe
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        this.fullscreenModalIframe?.contentWindow?.postMessage(
          { action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL, data: modalData },
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
    this.ensurePageInteractivity()
  }

  openShareModal(shareData: ShareModalData) {
    this.removeShareModal()
    const modalUrl = this.buildModalUrl('share')
    const cfg: FullscreenModalIframeConfig = {
      id: 'aiuta-share-modal',
      src: modalUrl.toString(),
      styles: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        zIndex: '10000',
        border: 'none',
        background: 'transparent',
      },
      allow: 'fullscreen',
    }
    const iframe = this.createOverlayIframe(cfg)
    document.body.appendChild(iframe)
    this.shareModalIframe = iframe
    this.setBodyScroll(false)
    iframe.addEventListener('load', () => {
      setTimeout(() => {
        this.shareModalIframe?.contentWindow?.postMessage(
          { action: MESSAGE_ACTIONS.OPEN_AIUTA_SHARE_MODAL, data: shareData },
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
    this.setBodyScroll(true)
    this.ensurePageInteractivity()
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
    if (this.originalIframeStyles) {
      this.restoreFromFullscreen()
      return
    }
    if (!this.iframe) return
    this.isOpen = false
    this.hide()
    if (document.body.parentElement?.style.overflow === 'hidden') {
      document.body.parentElement.style.overflow = ''
    }
  }

  private buildModalUrl(modalType: 'fullscreen' | 'share') {
    const baseUrl = window.location.origin
    const absoluteIframeUrl = this.iframeUrl.startsWith('http')
      ? this.iframeUrl
      : `${baseUrl}${this.iframeUrl}`
    const url = new URL(absoluteIframeUrl)
    url.searchParams.set('modal', 'true')
    url.searchParams.set('modalType', modalType)
    // Add parentOrigin parameter for RPC security
    url.searchParams.set('parentOrigin', encodeURIComponent(window.location.origin))
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

  private setBodyScroll(enabled: boolean) {
    if (document.body.parentElement) {
      const hasModals = this.fullscreenModalIframe || this.shareModalIframe
      if (enabled && !hasModals) document.body.parentElement.style.overflow = ''
      else if (!enabled) document.body.parentElement.style.overflow = 'hidden'
    }
  }

  private ensurePageInteractivity() {
    const overlays = document.querySelectorAll('[id^="aiuta-"]')
    overlays.forEach((overlay) => {
      if (
        overlay.id !== 'aiuta-iframe' &&
        overlay.id !== 'aiuta-fullscreen-modal' &&
        overlay.id !== 'aiuta-share-modal'
      ) {
        overlay.remove()
      }
    })
    if (document.body.parentElement) document.body.parentElement.style.overflow = ''
    document.body.style.pointerEvents = ''
    document.body.style.userSelect = ''
  }
}

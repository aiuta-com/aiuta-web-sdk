import {
  AiutaAuth,
  AiutaAnalytics,
  AiutaJwtCallback,
  AiutaConfiguration,
  AiutaUserInterface,
  AiutaIframePosition,
  AiutaAnalyticsCallback,
  AiutaStylesConfiguration,
  INITIALLY_STYLES_CONFIGURATION,
} from '@shared/config'
import { SecurePostMessageHandler } from './security'
import { MESSAGE_ACTIONS } from '@shared/messaging'
import Bowser from 'bowser'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

// Global variables injected by Vite
declare const __SDK_VERSION__: string
declare const __AIUTA_IFRAME_URL__: string
declare const __AIUTA_ANALYTICS_URL__: string

const SDK_POSITION = {
  topLeft: { top: '12px', left: '12px' },
  topRight: { top: '12px', right: '12px' },
  bottomLeft: { bottom: '12px', left: '12px' },
  bottomRight: { bottom: '12px', right: '12px' },
}

interface FullScreenModalData {
  activeImage: {
    id: string
    url: string
  }
  images: Array<{
    id: string
    url: string
  }>
  modalType?: string
}

interface ShareModalData {
  imageUrl: string
}

interface FullscreenModalIframeConfig {
  id: string
  src: string
  styles: {
    position: string
    top: string
    left: string
    width: string
    height: string
    zIndex: string
    border: string
    background: string
  }
  allow: string
}

export default class Aiuta {
  // Authentication
  private getJwt!: AiutaJwtCallback
  private apiKey!: string
  private userId!: string

  // User interface
  private sdkPosition: AiutaIframePosition = 'topRight'
  private stylesConfiguration: AiutaStylesConfiguration = INITIALLY_STYLES_CONFIGURATION
  private customCssUrl?: string

  // Analytics
  private analytics?: AiutaAnalyticsCallback

  // Runtime
  private productId!: string
  private isIframeOpen: boolean = false
  private iframe: HTMLIFrameElement | null = null
  private secureMessageHandler: SecurePostMessageHandler | null = null
  private originalIframeStyles: any = null
  private originalIframeParent: Element | null = null
  private fullscreenModalIframe: HTMLIFrameElement | null = null
  private pendingModalData: FullScreenModalData | null = null
  private shareModalIframe: HTMLIFrameElement | null = null
  private pendingShareData: ShareModalData | null = null
  private iframeOrigin: string = ''
  private env: {
    platform: string
    hostId: string
    sdkVersion: string
    iframeVersion: string | null
    browserType: string
    browserVersion: string
    os: string
    installationId: string
  }

  // URLs
  readonly iframeUrl = __AIUTA_IFRAME_URL__
  readonly analyticsUrl = __AIUTA_ANALYTICS_URL__

  constructor(configuration: AiutaConfiguration) {
    this.configureAuth(configuration.auth)

    const bowser = Bowser.parse(navigator.userAgent)

    this.env = {
      platform: 'web',
      hostId: window.origin,
      sdkVersion: __SDK_VERSION__,
      iframeVersion: null,
      browserType: bowser.browser.name || 'Unknown',
      browserVersion: bowser.browser.version || 'Unknown',
      os: bowser.os.name || 'Unknown',
      installationId: this.getInstallationId(),
    }

    this.initializeSecureMessageHandler()

    if (configuration.userInterface) {
      this.configureUserInterface(configuration.userInterface)
    }
    if (configuration.analytics) {
      this.configureAnalytics(configuration.analytics)
    }

    const analytic: any = {
      data: {
        type: 'configure',
      },
    }

    this.trackEvent(analytic)
  }

  private getInstallationId(): string {
    const INSTALLATION_ID_KEY = 'aiutaInstallationId'

    const existingId = localStorage.getItem(INSTALLATION_ID_KEY)
    if (existingId) {
      return existingId
    }

    const newId = uuidv4()
    localStorage.setItem(INSTALLATION_ID_KEY, newId)
    return newId
  }

  private initializeSecureMessageHandler(): void {
    try {
      // Extract iframe origin from URL
      if (this.iframeUrl.startsWith('/')) {
        // Handle relative paths (local debug mode)
        this.iframeOrigin = window.location.origin
      } else {
        // Handle full URLs
        const iframeUrl = new URL(this.iframeUrl)
        this.iframeOrigin = `${iframeUrl.protocol}//${iframeUrl.host}`
      }

      // Initialize secure message handler
      this.secureMessageHandler = new SecurePostMessageHandler(this.iframeOrigin)

      // Register message handlers
      this.registerMessageHandlers()
    } catch (error) {
      console.error('Failed to initialize secure message handler:', error)
    }
  }

  private registerMessageHandlers(): void {
    if (!this.secureMessageHandler) return

    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.CLOSE_MODAL,
      this.handleCloseModal.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.OPEN_SHARE_MODAL,
      this.handleOpenShareModal.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.SHARE_IMAGE,
      this.handleShareImage.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.GET_WINDOW_SIZES,
      this.handleGetWindowSizes.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.GET_AIUTA_JWT_TOKEN,
      this.handleGetJwtToken.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.GET_AIUTA_API_KEYS,
      this.handleGetApiKeys.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION,
      this.handleGetStylesConfiguration.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      this.handleOpenFullScreenModal.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.IFRAME_LOADED,
      this.handleIframeLoaded.bind(this),
    )

    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.ANALYTICS_EVENT,
      this.handleAnalyticsEvent.bind(this),
    )
    this.secureMessageHandler.registerHandler(
      MESSAGE_ACTIONS.REQUEST_FULLSCREEN_IFRAME,
      this.handleRequestFullscreenIframe.bind(this),
    )
  }

  trackEvent(data: Record<string, any>) {
    const body = {
      ...data,
      env: this.env,
      localDateTime: dayjs().format(),
    }

    // Send to analytics service
    fetch(this.analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(console.error)

    // Call analytics callback if provided
    if (typeof this.analytics === 'function') {
      this.analytics(data.data || data)
    }
  }

  private configureAuth(auth: AiutaAuth): void {
    if ('apiKey' in auth) {
      this.apiKey = auth.apiKey
    } else {
      this.userId = auth.subscriptionId
      this.getJwt = auth.getJwt
    }
  }

  private configureUserInterface(userInterface: AiutaUserInterface): void {
    if (userInterface.position && userInterface.position.length > 0) {
      this.sdkPosition = userInterface.position
    }

    if (userInterface.stylesConfiguration) {
      this.stylesConfiguration = userInterface.stylesConfiguration
    }

    if (userInterface.customCssUrl) {
      this.customCssUrl = userInterface.customCssUrl
    }
  }

  private configureAnalytics(analytics: AiutaAnalytics): void {
    if (analytics.handler && typeof analytics.handler.onAnalyticsEvent === 'function') {
      this.analytics = analytics.handler.onAnalyticsEvent
    }
  }

  private async getToken(uploaded_image_id: string, productId: string) {
    if (this.apiKey) return this.apiKey
    if (this.getJwt)
      return await this.getJwt({
        uploaded_image_id,
        product_id: productId,
      })
    throw new Error('Aiuta SDK is not initialized with API key or JWT')
  }

  private createIframe() {
    const aiutaIframe: any = document.createElement('iframe')
    aiutaIframe.id = 'aiuta-iframe'
    aiutaIframe.allow = 'fullscreen'

    let iframeSrc = this.iframeUrl.startsWith('/')
      ? `${window.location.origin}${this.iframeUrl}`
      : this.iframeUrl

    if (this.customCssUrl) {
      let resolvedCssUrl = this.customCssUrl

      if (!this.customCssUrl.startsWith('http')) {
        try {
          const currentOrigin = window.location.origin
          resolvedCssUrl = new URL(this.customCssUrl, currentOrigin).href
        } catch {
          const currentOrigin = window.location.origin
          resolvedCssUrl = this.customCssUrl.startsWith('/')
            ? `${currentOrigin}${this.customCssUrl}`
            : `${currentOrigin}/${this.customCssUrl}`
        }
      }

      const separator = iframeSrc.includes('?') ? '&' : '?'
      iframeSrc = `${iframeSrc}${separator}css=${encodeURIComponent(resolvedCssUrl)}`
    }

    aiutaIframe.src = iframeSrc
    aiutaIframe.style.transition = 'all ease-in-out 0.5s'
    aiutaIframe.style.position = 'fixed'
    aiutaIframe.style.width = '394px'
    aiutaIframe.style.height = '632px'
    aiutaIframe.style.borderRadius = '24px'
    aiutaIframe.style.zIndex = '9999'
    aiutaIframe.style.border = '1px solid #0000001A'
    aiutaIframe.style.boxShadow = '0px 8px 28px -6px #0000001F'

    switch (this.sdkPosition) {
      case 'topLeft':
        aiutaIframe.style.top = SDK_POSITION.topLeft.top
        aiutaIframe.style.left = '-1000%'
        break

      case 'topRight':
        aiutaIframe.style.top = SDK_POSITION.topRight.top
        aiutaIframe.style.right = '-1000%'
        break

      case 'bottomLeft':
        aiutaIframe.style.bottom = SDK_POSITION.bottomLeft.bottom
        aiutaIframe.style.left = '-1000%'
        break

      case 'bottomRight':
        aiutaIframe.style.bottom = SDK_POSITION.bottomRight.bottom
        aiutaIframe.style.right = '-1000%'

        break
    }

    document.body.append(aiutaIframe)

    this.iframe = aiutaIframe

    setTimeout(() => {
      if (window.innerWidth <= 992) {
        switch (this.sdkPosition) {
          case 'topLeft':
            aiutaIframe.style.left = '0px'
            break
          case 'bottomRight':
            aiutaIframe.style.right = '0px'
            break
          case 'bottomLeft':
            aiutaIframe.style.left = '0px'
            break
          case 'topRight':
            aiutaIframe.style.right = '0px'
            break
        }

        if (document && document.body && document.body.parentElement) {
          document.body.parentElement.style.overflow = 'hidden'
        }
      } else {
        switch (this.sdkPosition) {
          case 'topLeft':
            aiutaIframe.style.left = SDK_POSITION.topLeft.left
            break
          case 'topRight':
            aiutaIframe.style.right = SDK_POSITION.topRight.right
            break
          case 'bottomLeft':
            aiutaIframe.style.left = SDK_POSITION.bottomLeft.left
            break
          case 'bottomRight':
            aiutaIframe.style.right = SDK_POSITION.bottomRight.right
            break
        }
      }
    }, 1000)

    window.addEventListener('resize', () => {
      this.adjustIframeForViewport()
      this.handleResizeEvent()
    })
  }

  private async postMessageToIframe(message: any): Promise<any> {
    if (!this.iframe?.contentWindow || !this.secureMessageHandler) {
      throw new Error('Iframe or secure message handler not available')
    }

    try {
      // Extract action from message (could be 'action' or 'type' field)
      const action = message.action || message.type
      const data = message.data || message

      // Use events for messages that don't need responses
      if (
        action === MESSAGE_ACTIONS.BASE_KEYS ||
        action === MESSAGE_ACTIONS.GET_WINDOW_SIZES ||
        action === MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION ||
        action === MESSAGE_ACTIONS.JWT_TOKEN ||
        action === MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL
      ) {
        this.secureMessageHandler.sendEventToIframe(this.iframe, action, data)
        return Promise.resolve() // Return resolved promise for events
      } else {
        return await this.secureMessageHandler.sendToIframe(this.iframe, action, data)
      }
    } catch (error) {
      console.error(
        `Failed to send secure message to iframe: ${message.action || message.type}`,
        error,
      )
      throw error
    }
  }

  // Individual secure message handlers
  private handleCloseModal(): void {
    // Check if fullscreen modal iframe is open
    if (this.fullscreenModalIframe) {
      this.removeFullscreenModalIframe()
      return
    }

    // Check if share modal iframe is open
    if (this.shareModalIframe) {
      this.removeShareModalIframe()
      return
    }

    // Check if iframe is currently fullscreen
    if (this.originalIframeStyles) {
      this.restoreIframeFromFullscreen()
      return
    }

    // Handle normal iframe close
    if (!this.iframe) return

    this.isIframeOpen = false

    // Hide iframe normally
    switch (this.sdkPosition) {
      case 'topLeft':
        this.iframe.style.left = '-1000%'
        break
      case 'bottomRight':
        this.iframe.style.right = '-1000%'
        break
      case 'bottomLeft':
        this.iframe.style.left = '-1000%'
        break
      case 'topRight':
        this.iframe.style.right = '-1000%'
        break
    }

    if (
      document &&
      document.body &&
      document.body.parentElement &&
      document.body.parentElement.style.overflow === 'hidden'
    ) {
      document.body.parentElement.style.overflow = ''
    }
  }

  private restoreIframeFromFullscreen(): void {
    if (!this.iframe) return

    console.log('Restoring iframe from fullscreen...')

    // Restore original iframe styles
    if (this.originalIframeStyles) {
      Object.assign(this.iframe.style, this.originalIframeStyles)
      this.originalIframeStyles = null
    }

    // Move iframe back to original parent
    if (this.originalIframeParent && this.originalIframeParent !== document.body) {
      this.originalIframeParent.appendChild(this.iframe)
    }
    this.originalIframeParent = null

    // Restore body scroll
    if (document.body.parentElement) {
      document.body.parentElement.style.overflow = ''
    }
  }

  private handleOpenShareModal(message: any): void {
    if (message.data?.data?.imageUrl) {
      // Create a separate iframe for the share modal
      this.createShareModalIframe(message.data.data)
    }
  }

  private handleShareImage(message: any): void {
    if (navigator.share && message.data?.payload?.url) {
      navigator.share({
        url: message.data.payload.url,
        title: 'Check out this image',
        text: "Here's an image I generated!",
      })
    }
  }

  private async handleGetWindowSizes(): Promise<void> {
    try {
      const message = {
        action: MESSAGE_ACTIONS.GET_WINDOW_SIZES,
        width: window.innerWidth,
        height: window.innerHeight,
      }
      await this.postMessageToIframe(message)
    } catch (error) {
      console.error('Failed to send window sizes:', error)
    }
  }

  private async handleGetJwtToken(message: any): Promise<void> {
    try {
      const token = await this.getToken(message.data?.uploaded_image_id, this.productId)

      const responseMessage = {
        status: 200,
        skuId: this.productId,
        jwtToken: token,
        userId: this.userId,
        type: MESSAGE_ACTIONS.JWT_TOKEN,
      }
      await this.postMessageToIframe(responseMessage)
    } catch (error) {
      console.error('Failed to get JWT token:', error)
      try {
        const errorMessage = {
          status: 200,
          skuId: this.productId,
          jwtToken: undefined,
          userId: this.userId,
          type: MESSAGE_ACTIONS.JWT_TOKEN,
        }
        await this.postMessageToIframe(errorMessage)
      } catch (responseError) {
        console.error('Failed to send JWT error response:', responseError)
      }
    }
  }

  private async handleGetApiKeys(): Promise<void> {
    try {
      const message = {
        status: 200,
        skuId: this.productId,
        apiKey: this.apiKey,
        userId: this.userId,
        type: MESSAGE_ACTIONS.BASE_KEYS,
      }
      await this.postMessageToIframe(message)
    } catch (error) {
      console.error('Failed to send API keys:', error)
    }
  }

  private async handleGetStylesConfiguration(): Promise<void> {
    try {
      console.log('Sending styles configuration:', this.stylesConfiguration)
      const message = {
        action: MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION,
        data: {
          stylesConfiguration: this.stylesConfiguration.stylesConfiguration,
        },
      }
      await this.postMessageToIframe(message)
    } catch (error) {
      console.error('Failed to send styles configuration:', error)
    }
  }

  private handleOpenFullScreenModal(message: any): void {
    // Create a separate fullscreen iframe for the modal
    this.createFullscreenModalIframe(message.data as FullScreenModalData)
  }

  private createFullscreenModalIframe(modalData: FullScreenModalData): void {
    try {
      // Remove existing fullscreen iframe if any
      this.removeFullscreenModalIframe()

      // Store modal data for later transmission
      this.pendingModalData = modalData

      // Create and configure iframe (without modal data in URL)
      const iframeConfig = this.createFullscreenModalIframeConfig()
      const fullscreenIframe = this.createFullscreenIframeElement(iframeConfig)

      // Add to body and store reference
      document.body.appendChild(fullscreenIframe)
      this.fullscreenModalIframe = fullscreenIframe

      // Add load event listener to send modal data
      fullscreenIframe.addEventListener('load', () => {
        // Small delay to ensure iframe is ready
        setTimeout(() => {
          this.sendModalDataToFullscreenIframe()
        }, 100)
      })
    } catch (error) {
      console.error('Failed to create fullscreen modal iframe:', error)
    }
  }

  private createFullscreenModalIframeConfig(): FullscreenModalIframeConfig {
    const modalUrl = this.buildModalUrl()

    return {
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
  }

  private buildModalUrl(): URL {
    const baseUrl = window.location.origin
    const absoluteIframeUrl = this.iframeUrl.startsWith('http')
      ? this.iframeUrl
      : `${baseUrl}${this.iframeUrl}`

    const modalUrl = new URL(absoluteIframeUrl)
    modalUrl.searchParams.set('modal', 'true')
    modalUrl.searchParams.set('modalType', 'fullscreen')

    return modalUrl
  }

  private createFullscreenIframeElement(config: FullscreenModalIframeConfig): HTMLIFrameElement {
    const iframe = document.createElement('iframe')

    // Set basic attributes
    iframe.id = config.id
    iframe.src = config.src
    iframe.allow = config.allow

    // Apply styles
    Object.assign(iframe.style, config.styles)

    return iframe
  }

  private sendModalDataToFullscreenIframe(): void {
    if (this.fullscreenModalIframe && this.pendingModalData) {
      try {
        const message = {
          action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
          data: this.pendingModalData,
        }

        this.fullscreenModalIframe.contentWindow?.postMessage(message, this.iframeOrigin)
        this.pendingModalData = null // Clear after sending
      } catch (error) {
        console.error('Failed to send modal data to fullscreen iframe:', error)
      }
    }
  }

  private removeFullscreenModalIframe(): void {
    if (this.fullscreenModalIframe) {
      this.fullscreenModalIframe.remove()
      this.fullscreenModalIframe = null
    }

    // Ensure page is interactive
    this.ensurePageInteractivity()
  }

  private createShareModalIframe(shareData: ShareModalData): void {
    try {
      // Remove existing share modal iframe if any
      this.removeShareModalIframe()

      // Store share data for later transmission
      this.pendingShareData = shareData

      // Create and configure iframe
      const iframeConfig = this.createShareModalIframeConfig()
      const shareIframe = this.createShareIframeElement(iframeConfig)

      // Add to body and store reference
      document.body.appendChild(shareIframe)
      this.shareModalIframe = shareIframe

      // Prevent body scroll
      this.setBodyScroll(false)
    } catch (error) {
      console.error('Failed to create share modal iframe:', error)
    }
  }

  private createShareModalIframeConfig(): FullscreenModalIframeConfig {
    const modalUrl = this.buildShareModalUrl()

    return {
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
  }

  private buildShareModalUrl(): URL {
    const baseUrl = window.location.origin
    const absoluteIframeUrl = this.iframeUrl.startsWith('http')
      ? this.iframeUrl
      : `${baseUrl}${this.iframeUrl}`

    const modalUrl = new URL(absoluteIframeUrl)
    modalUrl.searchParams.set('modal', 'true')
    modalUrl.searchParams.set('modalType', 'share')

    return modalUrl
  }

  private createShareIframeElement(config: FullscreenModalIframeConfig): HTMLIFrameElement {
    const iframe = document.createElement('iframe')

    // Set basic attributes
    iframe.id = config.id
    iframe.src = config.src
    iframe.allow = config.allow

    // Apply styles
    Object.assign(iframe.style, config.styles)

    // Add load event listener to send share data
    iframe.addEventListener('load', () => {
      // Small delay to ensure iframe is ready
      setTimeout(() => {
        this.sendShareDataToIframe()
      }, 100)
    })

    return iframe
  }

  private sendShareDataToIframe(): void {
    if (this.shareModalIframe && this.pendingShareData) {
      try {
        const message = {
          action: MESSAGE_ACTIONS.OPEN_AIUTA_SHARE_MODAL,
          data: this.pendingShareData,
        }

        this.shareModalIframe.contentWindow?.postMessage(message, this.iframeOrigin)
        this.pendingShareData = null // Clear after sending
      } catch (error) {
        console.error('Failed to send share data to iframe:', error)
      }
    }
  }

  private removeShareModalIframe(): void {
    if (this.shareModalIframe) {
      this.shareModalIframe.remove()
      this.shareModalIframe = null
    }

    // Restore body scroll
    this.setBodyScroll(true)

    // Ensure page is interactive
    this.ensurePageInteractivity()
  }

  private setBodyScroll(enabled: boolean): void {
    if (document.body.parentElement) {
      // Only restore scroll if no modals are open
      const hasModals = this.fullscreenModalIframe || this.shareModalIframe
      if (enabled && !hasModals) {
        document.body.parentElement.style.overflow = ''
      } else if (!enabled) {
        document.body.parentElement.style.overflow = 'hidden'
      }
    }
  }

  private ensurePageInteractivity(): void {
    // Remove any remaining modal overlays (except main iframe, fullscreen modal, and share modal)
    const modalOverlays = document.querySelectorAll('[id^="aiuta-"]')
    modalOverlays.forEach((overlay) => {
      if (
        overlay.id !== 'aiuta-iframe' &&
        overlay.id !== 'aiuta-fullscreen-modal' &&
        overlay.id !== 'aiuta-share-modal'
      ) {
        overlay.remove()
      }
    })

    // Ensure body scroll is restored
    if (document.body.parentElement) {
      document.body.parentElement.style.overflow = ''
    }

    // Remove any event listeners that might be blocking interaction
    document.body.style.pointerEvents = ''
    document.body.style.userSelect = ''
  }

  private handleIframeLoaded(message: any): void {
    this.env.iframeVersion = message.data?.version

    const analytic: any = {
      data: {
        type: 'session',
        event: 'iframeLoaded',
      },
    }

    this.trackEvent(analytic)
  }

  private handleAnalyticsEvent(message: any): void {
    if (message.data?.analytic) {
      this.trackEvent(message.data.analytic)
    }
  }

  private handleRequestFullscreenIframe(message: any): void {
    // Instead of creating a separate iframe, make the main iframe fullscreen
    this.makeIframeFullscreen(message.data)
  }

  private makeIframeFullscreen(modalData: any): void {
    if (!this.iframe) return

    console.log('Making iframe fullscreen...')

    // Store original iframe styles
    this.originalIframeStyles = {
      position: this.iframe.style.position,
      top: this.iframe.style.top,
      left: this.iframe.style.left,
      right: this.iframe.style.right,
      bottom: this.iframe.style.bottom,
      width: this.iframe.style.width,
      height: this.iframe.style.height,
      zIndex: this.iframe.style.zIndex,
      borderRadius: this.iframe.style.borderRadius,
      border: this.iframe.style.border,
      boxShadow: this.iframe.style.boxShadow,
    }

    // Move iframe to body to ensure it's not constrained by parent containers
    this.originalIframeParent = this.iframe.parentElement
    if (this.iframe.parentElement && this.iframe.parentElement !== document.body) {
      document.body.appendChild(this.iframe)
    }

    // Make iframe fullscreen using CSS
    this.iframe.style.position = 'fixed'
    this.iframe.style.top = '0'
    this.iframe.style.left = '0'
    this.iframe.style.right = '0'
    this.iframe.style.bottom = '0'
    this.iframe.style.width = '100vw'
    this.iframe.style.height = '100vh'
    this.iframe.style.zIndex = '10000'
    this.iframe.style.borderRadius = '0'
    this.iframe.style.border = 'none'
    this.iframe.style.boxShadow = 'none'
    this.iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'

    console.log('Iframe fullscreen applied:', {
      position: this.iframe.style.position,
      width: this.iframe.style.width,
      height: this.iframe.style.height,
      zIndex: this.iframe.style.zIndex,
      top: this.iframe.style.top,
      left: this.iframe.style.left,
      right: this.iframe.style.right,
      bottom: this.iframe.style.bottom,
    })

    // Prevent body scroll
    if (document.body.parentElement) {
      document.body.parentElement.style.overflow = 'hidden'
    }

    // Send modal data to iframe
    this.postMessageToIframe({
      action: MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL,
      data: modalData,
    }).catch((error) => {
      console.error('Failed to send fullscreen modal data:', error)
    })
  }

  private async handleResizeEvent(): Promise<void> {
    if (this.iframe && this.isIframeOpen) {
      try {
        const message = {
          action: MESSAGE_ACTIONS.GET_WINDOW_SIZES,
          width: window.innerWidth,
          height: window.innerHeight,
        }
        await this.postMessageToIframe(message)
      } catch (error) {
        console.error('Failed to send resize event to iframe:', error)
      }
    }
  }

  private adjustIframeForViewport() {
    if (!this.iframe || !this.isIframeOpen) return

    if (window.innerWidth <= 992) {
      this.iframe.style.width = '100%'
      this.iframe.style.height = '100%'
      this.iframe.style.borderRadius = '0px'
      this.iframe.style.border = '1px solid #ffffff'

      switch (this.sdkPosition) {
        case 'topLeft':
          this.iframe.style.top = '0px'
          this.iframe.style.left = '0px'
          break
        case 'topRight':
          this.iframe.style.top = '0px'
          this.iframe.style.right = '0px'
          break
        case 'bottomLeft':
          this.iframe.style.left = '0px'
          this.iframe.style.bottom = '0px'
          break
        case 'bottomRight':
          this.iframe.style.right = '0px'
          this.iframe.style.bottom = '0px'
          break
      }
    } else {
      this.iframe.style.width = '394px'
      this.iframe.style.height = '632px'
      this.iframe.style.borderRadius = '24px'
      this.iframe.style.border = '1px solid #0000001A'

      switch (this.sdkPosition) {
        case 'topLeft':
          this.iframe.style.top = SDK_POSITION.topLeft.top
          break
        case 'topRight':
          this.iframe.style.top = SDK_POSITION.topRight.top
          break
        case 'bottomLeft':
          this.iframe.style.bottom = SDK_POSITION.bottomLeft.bottom
          break
        case 'bottomRight':
          this.iframe.style.bottom = SDK_POSITION.bottomRight.bottom
          break
      }
    }
  }

  startGeneration(productId: string) {
    if (!productId || !productId.length) {
      console.error('Product id is not provided for Aiuta.')
      return
    }

    this.isIframeOpen = true
    this.productId = productId

    const aiutaIframe = document.getElementById('aiuta-iframe')

    if (aiutaIframe) {
      if (window.innerWidth <= 992) {
        aiutaIframe.style.right = '0px'

        if (
          document &&
          document.body &&
          document.body.parentElement &&
          document.body.parentElement.style.overflow === 'hidden'
        ) {
          document.body.parentElement.style.overflow = ''
        } else {
          if (document && document.body && document.body.parentElement) {
            document.body.parentElement.style.overflow = 'hidden'
          }
        }
      } else {
        switch (this.sdkPosition) {
          case 'topLeft':
            aiutaIframe.style.left = SDK_POSITION.topLeft.left
            break
          case 'topRight':
            aiutaIframe.style.right = SDK_POSITION.topRight.right
            break
          case 'bottomLeft':
            aiutaIframe.style.left = SDK_POSITION.bottomLeft.left
            break
          case 'bottomRight':
            aiutaIframe.style.right = SDK_POSITION.bottomRight.right
            break
        }
      }
    } else {
      this.createIframe()
    }

    const analytic: any = {
      data: {
        type: 'session',
        flow: 'tryOn',
        productIds: [productId],
      },
    }

    this.trackEvent(analytic)
  }
}

// Re-export configuration types for external use
export type {
  AiutaConfiguration,
  AiutaAuth,
  AiutaApiKeyAuth,
  AiutaJwtAuth,
  AiutaUserInterface,
  AiutaFeatures,
  AiutaAnalytics,
  AiutaDebugSettings,
  AiutaIframePosition,
  AiutaStylesConfiguration,
  AiutaAnalyticsCallback,
  AiutaJwtCallback,
} from '@shared/config'

if (typeof window !== 'undefined') {
  ;(window as any).Aiuta = Aiuta
}

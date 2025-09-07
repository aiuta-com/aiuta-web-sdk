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
import { ShowFullScreenModal } from './fullScreenImageModal'
import { ShareModal } from './shareModal'
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

enum AnalyticEventsEnum {
  'tryOn' = 'tryOn',
  'share' = 'share',
  'loading' = 'loading',
  'results' = 'results',
  'history' = 'history',
  'onboarding' = 'onboarding',
  'tryOnError' = 'tryOnError',
  'closeModal' = 'closeModal',
  'tryOnAborted' = 'tryOnAborted',
  'newPhotoTaken' = 'newPhotoTaken',
  'uploadedPhotoDeleted' = 'uploadedPhotoDeleted',
  'uploadsHistoryOpened' = 'uploadsHistoryOpened',
  'uploadedPhotoSelected' = 'uploadedPhotoSelected',
  'generatedImageDeleted' = 'generatedImageDeleted',
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

    if (typeof this.analytics === 'function') {
      this.analytics(analytic.data)
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
      let iframeOrigin: string

      if (this.iframeUrl.startsWith('/')) {
        // Handle relative paths (local debug mode)
        iframeOrigin = window.location.origin
      } else {
        // Handle full URLs
        const iframeUrl = new URL(this.iframeUrl)
        iframeOrigin = `${iframeUrl.protocol}//${iframeUrl.host}`
      }

      // Initialize secure message handler
      this.secureMessageHandler = new SecurePostMessageHandler(iframeOrigin)

      // Register message handlers
      this.registerMessageHandlers()
    } catch (error) {
      console.error('Failed to initialize secure message handler:', error)
    }
  }

  private registerMessageHandlers(): void {
    if (!this.secureMessageHandler) return

    // Register all message handlers
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

    // Register analytics event handlers
    Object.values(AnalyticEventsEnum).forEach((event) => {
      this.secureMessageHandler!.registerHandler(event, this.handleAnalyticsEvent.bind(this))
    })
  }

  trackEvent(data: Record<string, any>) {
    const body = {
      ...data,
      env: this.env,
      localDateTime: dayjs().format(),
    }

    fetch(this.analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(console.error)
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
        action === MESSAGE_ACTIONS.JWT_TOKEN
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
    if (!this.iframe) return

    this.isIframeOpen = false

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

  private handleOpenShareModal(message: any): void {
    if (message.data?.imageUrl) {
      const shareModal = new ShareModal(message.data.imageUrl)
      shareModal.showModal()
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
    const fullScreenModal = new ShowFullScreenModal({
      activeImage: message.data?.activeImage,
      modalType: message.data?.modalType,
      images: message.data?.images,
    })

    fullScreenModal.showModal()
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

    if (typeof this.analytics === 'function') {
      this.analytics(analytic.data)
    }
  }

  private handleAnalyticsEvent(message: any): void {
    if (message.data?.analytic) {
      this.trackEvent(message.data.analytic)

      if (typeof this.analytics === 'function') {
        this.analytics(message.data.analytic.data)
      }
    }
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

    if (typeof this.analytics === 'function') {
      this.analytics(analytic.data)
    }
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

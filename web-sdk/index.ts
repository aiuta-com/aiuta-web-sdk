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

  private createIframe(apiKey: string, productId: string) {
    const aiutaIframe: any = document.createElement('iframe')
    aiutaIframe.id = 'aiuta-iframe'
    aiutaIframe.allow = 'fullscreen'

    let iframeSrc = this.iframeUrl
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

    aiutaIframe.onload = () => {
      aiutaIframe.contentWindow.postMessage(
        {
          status: 200,
          skuId: productId,
          apiKey: apiKey,
          type: 'baseKeys',
        },
        '*',
      )
    }

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

    window.addEventListener('resize', () => this.adjustIframeForViewport())
  }

  private postMessageToIframe(message: any) {
    if (!this.iframe?.contentWindow) return

    this.iframe.contentWindow.postMessage(message, '*')
  }

  private handleMessage() {
    const aiutaIframe = document.getElementById('aiuta-iframe') as HTMLIFrameElement
    if (!aiutaIframe) return

    if (aiutaIframe) {
      this.postMessageToIframe({
        status: 200,
        skuId: this.productId,
        apiKey: this.apiKey,
        userId: this.userId,
        type: 'baseKeys',
      })
    }

    aiutaIframe.onload = () => {
      const messages = async (event: any) => {
        const data = event.data
        switch (data.action) {
          case 'close_modal':
            if (aiutaIframe) {
              this.isIframeOpen = false

              switch (this.sdkPosition) {
                case 'topLeft':
                  aiutaIframe.style.left = '-1000%'
                  break
                case 'bottomRight':
                  aiutaIframe.style.right = '-1000%'
                  break
                case 'bottomLeft':
                  aiutaIframe.style.left = '-1000%'
                  break
                case 'topRight':
                  aiutaIframe.style.right = '-1000%'
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
            break

          case 'open_share_modal':
            if (data.imageUrl) {
              const shareModal = new ShareModal(data.imageUrl)
              shareModal.showModal()
            }
            break

          case 'SHARE_IMAGE':
            if (navigator.share && data.payload?.url) {
              navigator.share({
                url: data.payload.url,
                title: 'Check out this image',
                text: "Here's an image I generated!",
              })
            }
            break

          case 'get_window_sizes':
            this.postMessageToIframe({
              type: 'resize',
              width: window.innerWidth,
              height: window.innerHeight,
            })
            break

          case 'GET_AIUTA_JWT_TOKEN':
            if (aiutaIframe.contentWindow) {
              try {
                const token = await this.getToken(data.uploaded_image_id, this.productId)

                console.log('JWT token: ', token, 'PRODUCT ID', this.productId)

                this.postMessageToIframe({
                  status: 200,
                  skuId: this.productId,
                  jwtToken: token,
                  userId: this.userId,
                  type: 'jwt',
                })
              } catch {
                this.postMessageToIframe({
                  status: 200,
                  skuId: this.productId,
                  jwtToken: undefined,
                  userId: this.userId,
                  type: 'jwt',
                })
                console.error('Aiuta get JWT token error')
              }
            }
            break

          case 'GET_AIUTA_API_KEYS':
            console.log('PRODUCT ID', this.productId)

            if (aiutaIframe.contentWindow) {
              this.postMessageToIframe({
                status: 200,
                skuId: this.productId,
                apiKey: this.apiKey,
                userId: this.userId,
                type: 'baseKeys',
              })
            }
            break

          case 'GET_AIUTA_STYLES_CONFIGURATION':
            if (aiutaIframe.contentWindow) {
              if (this.stylesConfiguration) {
                this.postMessageToIframe({
                  type: 'stylesConfiguration',
                  stylesConfiguration: this.stylesConfiguration,
                })
              }
            }
            break

          case 'OPEN_AIUTA_FULL_SCREEN_MODAL':
            if (aiutaIframe.contentWindow) {
              const fullScreenModal = new ShowFullScreenModal({
                activeImage: data.activeImage,
                modalType: data.modalType,
                images: data.images,
              })

              fullScreenModal.showModal()
            }
            break

          case 'IFRAME_LOADED':
            if (aiutaIframe.contentWindow) {
              this.env.iframeVersion = data.version

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
            break

          case AnalyticEventsEnum.tryOn:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.share:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.results:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.history:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.onboarding:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.newPhotoTaken:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.uploadedPhotoDeleted:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.uploadedPhotoSelected:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.generatedImageDeleted:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.tryOnError:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.tryOnAborted:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.closeModal:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.uploadsHistoryOpened:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break

          case AnalyticEventsEnum.loading:
            if (aiutaIframe.contentWindow) {
              this.trackEvent(event.data.analytic)

              if (typeof this.analytics === 'function') {
                this.analytics(event.data.analytic.data)
              }
            }
            break
        }
      }

      if (window.innerWidth <= 992) {
        aiutaIframe.style.top = '0px'
        aiutaIframe.style.width = '100%'
        aiutaIframe.style.height = '100%'
        aiutaIframe.style.borderRadius = '0px'
        aiutaIframe.style.border = '1px solid #ffffff'

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

        if (aiutaIframe && aiutaIframe.contentWindow) {
          aiutaIframe.contentWindow.postMessage(
            {
              type: 'resize',
              width: window.innerWidth,
              height: window.innerHeight,
            },
            '*',
          )
        }
      }

      window.addEventListener('message', messages)

      window.addEventListener('resize', () => {
        if (aiutaIframe && aiutaIframe.contentWindow) {
          aiutaIframe.contentWindow.postMessage(
            {
              type: 'resize',
              width: window.innerWidth,
              height: window.innerHeight,
            },
            '*',
          )
        }
      })
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

      this.handleMessage()
    } else {
      this.createIframe(this.apiKey, productId)
      this.handleMessage()
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

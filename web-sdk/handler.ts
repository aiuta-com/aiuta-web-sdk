import { MESSAGE_ACTIONS } from '@shared/messaging'
import { SecurePostMessageHandler } from './security'
import AuthManager from './auth'
import IframeManager from './iframe'
import AnalyticsTracker from './analytics'
import { AiutaRpcSdk } from '@shared/rpc'
import type { SdkHandlers, SdkContext } from '@shared/rpc'
import type { AiutaConfiguration } from '@shared/config'

declare const __SDK_VERSION__: string

export default class MessageHandler {
  private secure: SecurePostMessageHandler
  private productId?: string
  private rpcSdk!: AiutaRpcSdk<AiutaConfiguration>

  constructor(
    private readonly auth: AuthManager,
    private readonly analytics: AnalyticsTracker,
    private readonly iframeManager: IframeManager,
    private readonly configuration: AiutaConfiguration,
  ) {
    this.secure = new SecurePostMessageHandler(iframeManager.getIframeOrigin())
    this.initializeRpc()
    this.registerHandlersAndListeners()
  }

  private initializeRpc() {
    // Initialize RPC SDK
    const handlers: SdkHandlers = {
      trackEvent: (event, ctx) => {
        console.log('[RPC SDK] Received trackEvent:', event, 'from context:', ctx)
        this.analytics.track({ data: event })
      },
    }

    const context: SdkContext<AiutaConfiguration> = {
      cfg: this.configuration,
      sdkVersion: __SDK_VERSION__,
    }

    this.rpcSdk = new AiutaRpcSdk<AiutaConfiguration>({
      context,
      handlers,
    })
  }

  setProductId(productId: string) {
    this.productId = productId
  }

  async tryOnViaRpc(productId: string) {
    try {
      const iframe = this.iframeManager.getIframe()
      if (iframe) {
        await this.rpcSdk.connect(iframe)
        await this.rpcSdk.app.tryOn(productId)
      }
    } catch (error) {
      console.error('RPC tryOn failed:', error)
      // Fallback: set product ID directly for iframe to pick up
      this.setProductId(productId)
      throw error // Re-throw so caller can handle fallback
    }
  }

  private registerHandlersAndListeners() {
    window.addEventListener('resize', () => {
      this.sendToIframe(MESSAGE_ACTIONS.GET_WINDOW_SIZES, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.CLOSE_MODAL, () => {
      this.iframeManager.closeOrHide()
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.OPEN_SHARE_MODAL, (data) => {
      const url = data?.data?.imageUrl
      if (url) this.iframeManager.openShareModal({ imageUrl: url })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.SHARE_IMAGE, (data) => {
      const url = data?.payload?.url
      if (navigator.share && url)
        navigator.share({
          url,
          title: 'Check out this image',
          text: "Here's an image I generated!",
        })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.GET_WINDOW_SIZES, () => {
      this.sendToIframe(MESSAGE_ACTIONS.GET_WINDOW_SIZES, {
        width: window.innerWidth,
        height: window.innerHeight,
      })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.GET_AIUTA_JWT_TOKEN, async (data) => {
      if (!this.productId) {
        console.error('Product ID not set')
        this.sendToIframe(MESSAGE_ACTIONS.JWT_TOKEN, {
          status: 400,
          error: 'Product ID not set',
          type: MESSAGE_ACTIONS.JWT_TOKEN,
        })
        return
      }
      const token = await this.auth.getToken(data?.uploaded_image_id, this.productId)
      this.sendToIframe(MESSAGE_ACTIONS.JWT_TOKEN, {
        status: 200,
        skuId: this.productId,
        jwtToken: token,
        userId: this.auth.getUserId?.(),
        type: MESSAGE_ACTIONS.JWT_TOKEN,
      })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.GET_AIUTA_API_KEYS, async () => {
      if (!this.productId) {
        console.error('Product ID not set')
        this.sendToIframe(MESSAGE_ACTIONS.BASE_KEYS, {
          status: 400,
          error: 'Product ID not set',
          type: MESSAGE_ACTIONS.BASE_KEYS,
        })
        return
      }
      this.sendToIframe(MESSAGE_ACTIONS.BASE_KEYS, {
        status: 200,
        skuId: this.productId,
        apiKey: this.auth.getApiKey?.(),
        userId: this.auth.getUserId?.(),
        type: MESSAGE_ACTIONS.BASE_KEYS,
      })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION, async () => {
      this.sendToIframe(MESSAGE_ACTIONS.STYLES_CONFIGURATION, {
        action: MESSAGE_ACTIONS.GET_AIUTA_STYLES_CONFIGURATION,
        data: {
          stylesConfiguration: this.iframeManager.stylesConfiguration.stylesConfiguration,
        },
      })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.OPEN_AIUTA_FULL_SCREEN_MODAL, (data) => {
      this.iframeManager.openFullscreenModal(data)
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.IFRAME_LOADED, (data) => {
      if (data?.version) {
        this.analytics.setIframeVersion(data.version)
      }
      this.analytics.track({ data: { type: 'session', event: 'iframeLoaded' } })
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.ANALYTICS_EVENT, (data) => {
      if (data?.analytic) this.analytics.track(data.analytic)
    })

    this.secure.registerHandler(MESSAGE_ACTIONS.REQUEST_FULLSCREEN_IFRAME, (data) => {
      this.iframeManager.makeMainIframeFullscreen(data)
    })
  }

  private sendToIframe(action: string, data?: any) {
    const iframe = this.iframeManager.getIframe()
    if (iframe) this.secure.sendToIframe(iframe, action as any, data)
  }
}

export interface AnalyticsEvent {
  type: string
  event: string
  pageId: string
  productIds: string[]
  errorType?: string
  errorMessage?: string
  tryOnDuration?: number
  abortReason?: string
}

export interface RpcProxy {
  sdk: {
    trackEvent: (data: { data: AnalyticsEvent }) => void
  }
}

export class AnalyticsService {
  constructor(
    private rpc: RpcProxy,
    private productId?: string,
  ) {}

  private createEvent(eventData: Partial<AnalyticsEvent>): { data: AnalyticsEvent } {
    return {
      data: {
        productIds: [this.productId || ''],
        ...eventData,
      } as AnalyticsEvent,
    }
  }

  trackTryOnInitiated() {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'initiated',
        pageId: 'imagePicker',
      }),
    )
  }

  trackTryOnStarted() {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'tryOnStarted',
        pageId: 'loading',
      }),
    )
  }

  trackTryOnFinished(tryOnDuration: number) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'tryOnFinished',
        pageId: 'loading',
        tryOnDuration,
      }),
    )
  }

  trackTryOnError(errorType: string, errorMessage: string, pageId: string = 'loading') {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'tryOnError',
        pageId,
        errorType,
        errorMessage,
      }),
    )
  }

  trackTryOnAborted(abortReason: string) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'tryOnAborted',
        abortReason,
        pageId: 'result',
      }),
    )
  }

  trackPageView(pageId: string) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'page',
        pageId,
      }),
    )
  }

  trackUploadError(errorType: string, errorMessage: string) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        event: 'tryOnError',
        pageId: 'imagePicker',
        type: 'preparePhotoFailed',
        errorType,
        errorMessage,
      }),
    )
  }
}

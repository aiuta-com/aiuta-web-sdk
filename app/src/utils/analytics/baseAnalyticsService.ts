export interface AnalyticsEvent {
  type: string
  event: string
  pageId: string
  productIds: string[]
  errorType?: string
  errorMessage?: string
  tryOnDuration?: number
  abortReason?: string
  [key: string]: any
}

export interface RpcProxy {
  sdk: {
    trackEvent: (data: AnalyticsEvent) => void
  }
}

/**
 * Base analytics service with common functionality
 */
export abstract class BaseAnalyticsService {
  constructor(
    protected rpc: RpcProxy,
    protected productIds: string[] = [],
  ) {}

  protected createEvent(eventData: Partial<AnalyticsEvent>): AnalyticsEvent {
    return {
      productIds: this.productIds,
      ...eventData,
    } as AnalyticsEvent
  }

  trackPageView(pageId: string) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'page',
        pageId,
      }),
    )
  }

  protected trackError(
    event: string,
    pageId: string,
    errorType: string,
    errorMessage: string,
    additionalData?: Record<string, any>,
  ) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        event,
        pageId,
        errorType,
        errorMessage,
        ...additionalData,
      }),
    )
  }
}

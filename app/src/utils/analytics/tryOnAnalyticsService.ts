import { BaseAnalyticsService } from './baseAnalyticsService'

export class TryOnAnalyticsService extends BaseAnalyticsService {
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
    this.trackError('tryOnError', pageId, errorType, errorMessage, { type: 'tryOn' })
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

  trackUploadError(errorType: string, errorMessage: string) {
    this.trackError('tryOnError', 'imagePicker', errorType, errorMessage, {
      type: 'preparePhotoFailed',
    })
  }
}

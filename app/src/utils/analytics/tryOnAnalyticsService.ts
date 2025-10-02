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

  trackPhotoUploaded() {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'photoUploaded',
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

  trackTryOnFinished(durations: {
    uploadDuration?: number
    tryOnDuration?: number
    downloadDuration?: number
    totalDuration?: number
  }) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'tryOn',
        event: 'tryOnFinished',
        pageId: 'loading',
        ...durations,
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
        pageId: 'results',
      }),
    )
  }

  trackUploadError(errorType: string, errorMessage: string) {
    this.trackError('tryOnError', 'imagePicker', errorType, errorMessage, {
      type: 'preparePhotoFailed',
    })
  }
}

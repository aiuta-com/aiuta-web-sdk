import { BaseAnalyticsService } from './baseAnalyticsService'

/**
 * Analytics service for gallery-related events
 */
export class GalleryAnalyticsService extends BaseAnalyticsService {
  trackGalleryOpened(galleryType: 'uploads' | 'generations') {
    const eventMap = {
      uploads: 'uploadsHistoryOpened',
      generations: 'generationsHistoryOpened',
    }

    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'picker',
        event: eventMap[galleryType],
        pageId: galleryType === 'uploads' ? 'imagePicker' : 'history',
      }),
    )
  }

  trackImageSelected(imageId: string, galleryType: 'uploads' | 'generations') {
    const eventMap = {
      uploads: 'uploadedPhotoSelected',
      generations: 'generatedImageSelected',
    }

    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: galleryType === 'uploads' ? 'picker' : 'history',
        event: eventMap[galleryType],
        pageId: galleryType === 'uploads' ? 'imagePicker' : 'history',
        imageId,
      }),
    )
  }

  trackImageDeleted(imageId: string, galleryType: 'uploads' | 'generations') {
    const eventMap = {
      uploads: 'uploadedPhotoDeleted',
      generations: 'generatedImageDeleted',
    }

    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: galleryType === 'uploads' ? 'picker' : 'history',
        event: eventMap[galleryType],
        pageId: galleryType === 'uploads' ? 'imagePicker' : 'history',
        imageId,
      }),
    )
  }

  trackImageShared(imageUrl: string) {
    this.rpc.sdk.trackEvent(
      this.createEvent({
        type: 'share',
        event: 'succeeded',
        pageId: 'results',
        imageUrl,
      }),
    )
  }
}

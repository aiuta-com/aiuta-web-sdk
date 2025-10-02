import { useCallback } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'

type GalleryType = 'history' | 'previously' | 'uploads' | 'generations'

interface AnalyticsEvent {
  type: string
  pageId: string
  event: string
  productIds: string[]
}

/**
 * Hook for managing gallery analytics events
 */
export const useGalleryAnalytics = (galleryType: GalleryType) => {
  const rpc = useRpc()
  const productId = useAppSelector(productIdSelector)

  const trackEvent = useCallback(
    (event: string, additionalData?: Record<string, any>) => {
      if (!productId) return

      const analytic: AnalyticsEvent = {
        type: galleryType === 'history' || galleryType === 'generations' ? 'history' : 'picker',
        pageId:
          galleryType === 'history' || galleryType === 'generations' ? 'history' : 'imagePicker',
        event,
        productIds: [productId],
        ...additionalData,
      }

      rpc.sdk.trackEvent(analytic as unknown as Record<string, unknown>)
    },
    [rpc, productId, galleryType],
  )

  const trackPageView = useCallback(() => {
    trackEvent(
      galleryType === 'history' || galleryType === 'generations'
        ? 'pageView'
        : 'uploadsHistoryOpened',
    )
  }, [trackEvent, galleryType])

  const trackImageSelected = useCallback(
    (imageId: string) => {
      trackEvent(
        galleryType === 'history' || galleryType === 'generations'
          ? 'generatedImageSelected'
          : 'uploadedPhotoSelected',
        { imageId },
      )
    },
    [trackEvent, galleryType],
  )

  const trackImageDeleted = useCallback(
    (imageId: string) => {
      trackEvent(
        galleryType === 'history' || galleryType === 'generations'
          ? 'generatedImageDeleted'
          : 'uploadedPhotoDeleted',
        { imageId },
      )
    },
    [trackEvent, galleryType],
  )

  return {
    trackPageView,
    trackImageSelected,
    trackImageDeleted,
    trackEvent,
  }
}

import { useRef } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { useRpcProxy } from '@/contexts'
import { TryOnAnalyticsService } from '@/utils/analytics/tryOnAnalyticsService'

export const useTryOnAnalytics = () => {
  const rpc = useRpcProxy()
  const productId = useAppSelector(productIdSelector)
  const startTimeRef = useRef<number>(0)

  const analytics = new TryOnAnalyticsService(rpc, productId)

  const trackTryOnInitiated = () => {
    analytics.trackTryOnInitiated()
    analytics.trackPageView('loading')
    analytics.trackTryOnStarted()
    startTimeRef.current = Date.now()
  }

  const trackTryOnFinished = () => {
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
    analytics.trackTryOnFinished(duration)
  }

  const trackTryOnError = (errorType: string, errorMessage: string, pageId?: string) => {
    analytics.trackTryOnError(errorType, errorMessage, pageId)
  }

  const trackTryOnAborted = (abortReason: string) => {
    analytics.trackTryOnAborted(abortReason)
  }

  const trackUploadError = (errorType: string, errorMessage: string) => {
    analytics.trackUploadError(errorType, errorMessage)
  }

  return {
    trackTryOnInitiated,
    trackTryOnFinished,
    trackTryOnError,
    trackTryOnAborted,
    trackUploadError,
  }
}

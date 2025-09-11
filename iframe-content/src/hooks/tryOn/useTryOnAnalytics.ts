import { useRef } from 'react'
import { useAppSelector } from '@lib/redux/store'
import { aiutaEndpointDataSelector } from '@lib/redux/slices/configSlice/selectors'
import { useRpcProxy } from '@/contexts'
import { AnalyticsService } from '../../utils/analyticsService'

export const useTryOnAnalytics = () => {
  const rpc = useRpcProxy()
  const endpointData = useAppSelector(aiutaEndpointDataSelector)
  const startTimeRef = useRef<number>(0)

  const analytics = new AnalyticsService(rpc, endpointData?.skuId)

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

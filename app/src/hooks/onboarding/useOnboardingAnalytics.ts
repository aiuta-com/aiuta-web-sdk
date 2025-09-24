import { useCallback } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'

export type OnboardingPageId = 'howItWorks' | 'bestResults' | 'consent'
export type OnboardingEventType = 'page' | 'onboarding'
export type OnboardingEvent = 'consentsGiven' | 'onboardingFinished'

interface AnalyticsEvent {
  type: OnboardingEventType
  pageId?: OnboardingPageId
  event?: OnboardingEvent
  productIds: string[]
}

export const useOnboardingAnalytics = () => {
  const rpc = useRpc()
  const productId = useAppSelector(productIdSelector)

  const trackEvent = useCallback(
    (event: AnalyticsEvent) => {
      // Only track if productId exists
      if (!productId || productId.length === 0) {
        return
      }

      const analytic = {
        data: {
          ...event,
          productIds: [productId],
        },
      }

      rpc.sdk.trackEvent(analytic)
    },
    [rpc, productId],
  )

  const trackPageView = useCallback(
    (pageId: OnboardingPageId) => {
      trackEvent({
        type: 'page',
        pageId,
        productIds: [productId],
      })
    },
    [trackEvent, productId],
  )

  const trackConsentsGiven = useCallback(() => {
    trackEvent({
      type: 'onboarding',
      pageId: 'consent',
      event: 'consentsGiven',
      productIds: [productId],
    })
  }, [trackEvent, productId])

  const trackOnboardingFinished = useCallback(() => {
    trackEvent({
      type: 'onboarding',
      pageId: 'consent',
      event: 'onboardingFinished',
      productIds: [productId],
    })
  }, [trackEvent, productId])

  return {
    trackPageView,
    trackConsentsGiven,
    trackOnboardingFinished,
  }
}

import { useCallback } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
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
  const productIds = useAppSelector(productIdsSelector)

  const trackEvent = useCallback(
    (event: AnalyticsEvent) => {
      // Only track if productIds exists
      if (!productIds || productIds.length === 0) {
        return
      }

      const analytic = {
        ...event,
        productIds,
      }

      rpc.sdk.trackEvent(analytic)
    },
    [rpc, productIds],
  )

  const trackPageView = useCallback(
    (pageId: OnboardingPageId) => {
      trackEvent({
        type: 'page',
        pageId,
        productIds,
      })
    },
    [trackEvent, productIds],
  )

  const trackConsentsGiven = useCallback(() => {
    trackEvent({
      type: 'onboarding',
      pageId: 'consent',
      event: 'consentsGiven',
      productIds,
    })
  }, [trackEvent, productIds])

  const trackOnboardingFinished = useCallback(() => {
    trackEvent({
      type: 'onboarding',
      pageId: 'consent',
      event: 'onboardingFinished',
      productIds,
    })
  }, [trackEvent, productIds])

  return {
    trackPageView,
    trackConsentsGiven,
    trackOnboardingFinished,
  }
}

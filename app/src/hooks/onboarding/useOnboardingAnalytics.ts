import { useCallback } from 'react'
import { useAppSelector } from '@/store/store'
import { productIdsSelector, tryOnModeSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'
import type { AiutaMode } from '@lib/config'

export type OnboardingPageId = 'howItWorks' | 'bestResults' | 'consent'
export type OnboardingEventType = 'page' | 'onboarding'
export type OnboardingEvent = 'consentsGiven' | 'onboardingFinished'

interface AnalyticsEvent {
  type: OnboardingEventType
  pageId?: OnboardingPageId
  event?: OnboardingEvent
  productIds: string[]
  mode: AiutaMode
}

export const useOnboardingAnalytics = () => {
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const mode = useAppSelector(tryOnModeSelector)

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
        mode,
      })
    },
    [trackEvent, productIds, mode],
  )

  const trackConsentsGiven = useCallback(() => {
    trackEvent({
      type: 'onboarding',
      pageId: 'consent',
      event: 'consentsGiven',
      productIds,
      mode,
    })
  }, [trackEvent, productIds, mode])

  // Fired when a mode's onboarding is counted as completed — that happens on
  // the Next press of an info slide, so the pageId of that slide is passed in
  const trackOnboardingFinished = useCallback(
    (pageId: OnboardingPageId) => {
      trackEvent({
        type: 'onboarding',
        pageId,
        event: 'onboardingFinished',
        productIds,
        mode,
      })
    },
    [trackEvent, productIds, mode],
  )

  return {
    trackPageView,
    trackConsentsGiven,
    trackOnboardingFinished,
  }
}

import { useState, useEffect, useCallback } from 'react'
import { useOnboardingAnalytics, type OnboardingPageId } from './useOnboardingAnalytics'
import type { OnboardingSlideId } from '@/utils/onboarding/onboardingFlow'

// Analytics page ids stay stable across modes: the shoes best-results slide
// reports 'bestResults' and is distinguished by the event's mode field.
const PAGE_IDS: Record<OnboardingSlideId, OnboardingPageId> = {
  howItWorks: 'howItWorks',
  bestResults: 'bestResults',
  shoesBestResults: 'bestResults',
  consent: 'consent',
}

export const pageIdForSlide = (slideId: OnboardingSlideId): OnboardingPageId => PAGE_IDS[slideId]

/**
 * Navigation over a session's onboarding slide list with page-view analytics.
 */
export const useOnboardingSlides = (slides: OnboardingSlideId[]) => {
  const { trackPageView } = useOnboardingAnalytics()

  const [currentSlide, setCurrentSlide] = useState(0)

  // Track analytics when slide changes
  useEffect(() => {
    const slideId = slides[currentSlide]
    if (slideId) {
      trackPageView(PAGE_IDS[slideId])
    }
  }, [currentSlide, slides, trackPageView])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))
  }, [slides.length])

  const previousSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }, [])

  const getSlideState = useCallback(
    (slideIndex: number) => {
      if (slideIndex < currentSlide) return 'completed'
      if (slideIndex === currentSlide) return 'active'
      return 'pending'
    },
    [currentSlide],
  )

  return {
    currentSlide,
    currentSlideId: slides[currentSlide],
    isLastSlide: currentSlide >= slides.length - 1,
    nextSlide,
    previousSlide,
    getSlideState,
  }
}

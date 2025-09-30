import { useState, useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import {
  onboardingCurrentStepSelector,
  onboardingIsCompletedSelector,
} from '@/store/slices/onboardingSlice'
import { useOnboardingAnalytics } from './useOnboardingAnalytics'
import { OnboardingPageId } from './useOnboardingAnalytics'

export interface SlidesConfig {
  /** Whether to track analytics automatically */
  enableAnalytics?: boolean
  /** Initial slide index */
  initialSlide?: number
}

export const useOnboardingSlides = (config: SlidesConfig = {}) => {
  const { enableAnalytics = true, initialSlide = 0 } = config

  const dispatch = useAppDispatch()
  const { trackPageView } = useOnboardingAnalytics()

  // Redux state
  const globalCurrentStep = useAppSelector(onboardingCurrentStepSelector)
  const isOnboardingCompleted = useAppSelector(onboardingIsCompletedSelector)

  // Local state for component-specific slide management
  const [currentSlide, setCurrentSlide] = useState(initialSlide)
  const [isConsentChecked, setIsConsentChecked] = useState(false)

  // Map slide index to analytics page ID
  const getPageIdForSlide = useCallback((slideIndex: number): OnboardingPageId | null => {
    switch (slideIndex) {
      case 0:
        return 'howItWorks'
      case 1:
        return 'bestResults'
      case 2:
        return 'consent'
      default:
        return null
    }
  }, [])

  // Track analytics when slide changes
  useEffect(() => {
    if (enableAnalytics && !isOnboardingCompleted) {
      const pageId = getPageIdForSlide(currentSlide)
      if (pageId) {
        trackPageView(pageId)
      }
    }
  }, [currentSlide, enableAnalytics, isOnboardingCompleted, getPageIdForSlide, trackPageView])

  // Slide navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => prev + 1)
  }, [])

  const previousSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }, [])

  const goToSlide = useCallback((slideIndex: number) => {
    setCurrentSlide(slideIndex)
  }, [])

  // Redux actions
  const completeOnboarding = useCallback(() => {
    dispatch(onboardingSlice.actions.setIsCompleted(true))
  }, [dispatch])

  const updateGlobalStep = useCallback(() => {
    dispatch(onboardingSlice.actions.nextStep())
  }, [dispatch])

  // Helper functions
  const isLastSlide = useCallback((slide: number, totalSlides: number) => {
    return slide >= totalSlides - 1
  }, [])

  const getSlideState = useCallback(
    (slideIndex: number) => {
      if (slideIndex < currentSlide) return 'completed'
      if (slideIndex === currentSlide) return 'active'
      return 'pending'
    },
    [currentSlide],
  )

  const canProceed = useCallback(
    (slide: number) => {
      // Slide 2 (consent) requires checkbox to be checked
      if (slide === 2) {
        return isConsentChecked
      }
      return true
    },
    [isConsentChecked],
  )

  return {
    // State
    currentSlide,
    isConsentChecked,
    isOnboardingCompleted,
    globalCurrentStep,

    // Actions
    setCurrentSlide,
    setIsConsentChecked,
    nextSlide,
    previousSlide,
    goToSlide,
    completeOnboarding,
    updateGlobalStep,

    // Helpers
    isLastSlide,
    getSlideState,
    canProceed,
    getPageIdForSlide,
  }
}

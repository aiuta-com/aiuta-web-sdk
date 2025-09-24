import { useState, useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { onboardingSlice } from '@/store/slices/onboardingSlice'
import {
  onboardingCurrentStepSelector,
  onboardingIsCompletedSelector,
} from '@/store/slices/onboardingSlice'
import { useOnboardingAnalytics } from './useOnboardingAnalytics'
import { OnboardingPageId } from './useOnboardingAnalytics'

export interface OnboardingStepsConfig {
  /** Whether to track analytics automatically */
  enableAnalytics?: boolean
  /** Initial step index */
  initialStep?: number
}

export const useOnboardingSteps = (config: OnboardingStepsConfig = {}) => {
  const { enableAnalytics = true, initialStep = 0 } = config

  const dispatch = useAppDispatch()
  const { trackPageView } = useOnboardingAnalytics()

  // Redux state
  const globalCurrentStep = useAppSelector(onboardingCurrentStepSelector)
  const isOnboardingCompleted = useAppSelector(onboardingIsCompletedSelector)

  // Local state for component-specific step management
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isConsentChecked, setIsConsentChecked] = useState(false)

  // Map step index to analytics page ID
  const getPageIdForStep = useCallback((stepIndex: number): OnboardingPageId | null => {
    switch (stepIndex) {
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

  // Track analytics when step changes
  useEffect(() => {
    if (enableAnalytics && !isOnboardingCompleted) {
      const pageId = getPageIdForStep(currentStep)
      if (pageId) {
        trackPageView(pageId)
      }
    }
  }, [currentStep, enableAnalytics, isOnboardingCompleted, getPageIdForStep, trackPageView])

  // Step navigation functions
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const goToStep = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex)
  }, [])

  // Redux actions
  const completeOnboarding = useCallback(() => {
    dispatch(onboardingSlice.actions.setIsCompleted(true))
  }, [dispatch])

  const updateGlobalStep = useCallback(() => {
    dispatch(onboardingSlice.actions.nextStep())
  }, [dispatch])

  // Helper functions
  const isLastStep = useCallback((step: number, totalSteps: number) => {
    return step >= totalSteps - 1
  }, [])

  const getStepState = useCallback(
    (stepIndex: number) => {
      if (stepIndex < currentStep) return 'completed'
      if (stepIndex === currentStep) return 'active'
      return 'pending'
    },
    [currentStep],
  )

  const canProceed = useCallback(
    (step: number) => {
      // Step 2 (consent) requires checkbox to be checked
      if (step === 2) {
        return isConsentChecked
      }
      return true
    },
    [isConsentChecked],
  )

  return {
    // State
    currentStep,
    isConsentChecked,
    isOnboardingCompleted,
    globalCurrentStep,

    // Actions
    setCurrentStep,
    setIsConsentChecked,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    updateGlobalStep,

    // Helpers
    isLastStep,
    getStepState,
    canProceed,
    getPageIdForStep,
  }
}

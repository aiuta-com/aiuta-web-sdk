import React from 'react'
import { OnboardingStep, Consent, PrimaryButton } from '@/components'
import { useOnboardingSteps, useOnboardingAnalytics } from '@/hooks'
import styles from './OnboardingDesktop.module.scss'

interface OnboardingDesktopProps {
  onComplete: () => void
}

export const OnboardingDesktop = ({ onComplete }: OnboardingDesktopProps) => {
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()

  const {
    currentStep,
    isConsentChecked,
    setIsConsentChecked,
    nextStep,
    getStepState,
    isLastStep,
    canProceed,
    completeOnboarding,
  } = useOnboardingSteps()

  const handleNext = () => {
    if (isLastStep(currentStep, 3)) {
      // Track consent and completion
      trackConsentsGiven()
      trackOnboardingFinished()
      completeOnboarding()
      onComplete()
    } else {
      nextStep()
    }
  }

  return (
    <div className={styles.onboardingDesktop}>
      <div className={styles.stepsContainer}>
        <OnboardingStep state={getStepState(0)}>
          <div className={styles.stepContent}>
            <img
              alt="Try on before buying"
              className={styles.stepImage}
              src="./images/firstOnboarding.png"
            />
            <div className={styles.titlesBox}>
              <h2 className={`aiuta-title-l ${styles.title}`}>Try on before buying</h2>
              <h3 className={`aiuta-label-regular ${styles.description}`}>
                Upload a photo and see how items look on you
              </h3>
            </div>
          </div>
        </OnboardingStep>

        <OnboardingStep state={getStepState(1)}>
          <div className={styles.stepContent}>
            <img
              alt="For the best results"
              className={styles.stepImage}
              src="./images/lastOnboarding.png"
            />
            <div className={styles.titlesBox}>
              <h2 className={`aiuta-title-l ${styles.title}`}>For the best results</h2>
              <h3 className={`aiuta-label-regular ${styles.description}`}>
                Use a photo with good lighting, stand straight a plain background
              </h3>
            </div>
          </div>
        </OnboardingStep>

        <OnboardingStep state={getStepState(2)}>
          <Consent isChecked={isConsentChecked} onCheckChange={setIsConsentChecked} />
        </OnboardingStep>
      </div>

      <PrimaryButton disabled={!canProceed(currentStep)} onClick={handleNext}>
        {isLastStep(currentStep, 3) ? 'Start' : 'Next'}
      </PrimaryButton>
    </div>
  )
}

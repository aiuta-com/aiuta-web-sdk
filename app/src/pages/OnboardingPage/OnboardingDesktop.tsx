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
        <OnboardingStep
          state={getStepState(0)}
          isFirst={true}
          title="Try on before buying"
          description="Just upload your photo and see how it looks"
          imageUrl="./images/firstOnboarding.png"
        />

        <OnboardingStep
          state={getStepState(1)}
          title="For the best results..."
          description="Use a photo with good lighting, stand straight a plain background"
          imageUrl="./images/lastOnboarding.png"
        />

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

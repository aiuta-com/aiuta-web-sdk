import React from 'react'
import { OnboardingSlide, Consent, PrimaryButton } from '@/components'
import { useOnboardingSlides, useOnboardingAnalytics, useSwipeGesture } from '@/hooks'
import styles from './Onboarding.module.scss'

interface OnboardingDesktopProps {
  onComplete: () => void
}

export const OnboardingDesktop = ({ onComplete }: OnboardingDesktopProps) => {
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()

  const {
    currentSlide,
    isConsentChecked,
    setIsConsentChecked,
    nextSlide,
    previousSlide,
    getSlideState,
    isLastSlide,
    canProceed,
    completeOnboarding,
  } = useOnboardingSlides()

  const handleNext = () => {
    if (!canProceed(currentSlide)) return

    if (isLastSlide(currentSlide, 3)) {
      // Track consent and completion
      trackConsentsGiven()
      trackOnboardingFinished()
      completeOnboarding()
      onComplete()
    } else {
      nextSlide()
    }
  }

  const handlePrevious = () => {
    if (currentSlide > 0) {
      previousSlide()
    }
  }

  const swipeHandlers = useSwipeGesture(({ direction }) => {
    if (direction === 'left') {
      handleNext()
    } else if (direction === 'right') {
      handlePrevious()
    }
  })

  return (
    <main className={styles.onboarding} {...swipeHandlers}>
      <div className={styles.slides}>
        <OnboardingSlide state={getSlideState(0)}>
          <img
            alt="How it works guide"
            className={`${styles.image} ${styles.image_howItWorks}`}
            src="./images/firstOnboarding.png"
          />

          <h2 className={`aiuta-title-m ${styles.title}`}>Try on before buying</h2>
          <h3 className={`aiuta-label-regular ${styles.description}`}>
            Upload a photo and see how items look on you
          </h3>
        </OnboardingSlide>

        <OnboardingSlide state={getSlideState(1)}>
          <img
            alt="Best results guide"
            className={`${styles.image} ${styles.image_bestResults}`}
            src="./images/lastOnboarding.png"
          />

          <h2 className={`aiuta-title-m ${styles.title}`}>For the best results</h2>
          <h3 className={`aiuta-label-regular ${styles.description}`}>
            Use a photo with good lighting, stand straight a plain background
          </h3>
        </OnboardingSlide>

        <OnboardingSlide state={getSlideState(2)}>
          <Consent isChecked={isConsentChecked} onCheckChange={setIsConsentChecked} />
        </OnboardingSlide>
      </div>

      <PrimaryButton disabled={!canProceed(currentSlide)} onClick={handleNext}>
        {isLastSlide(currentSlide, 3) ? 'Start' : 'Next'}
      </PrimaryButton>
    </main>
  )
}

import React from 'react'
import { Slide, Consent, PrimaryButton } from '@/components'
import {
  useOnboardingSlides,
  useOnboardingAnalytics,
  useSwipeGesture,
  useOnboardingStrings,
} from '@/hooks'
import styles from './Onboarding.module.scss'

interface OnboardingDesktopProps {
  onComplete: () => void
}

export const OnboardingDesktop = ({ onComplete }: OnboardingDesktopProps) => {
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()
  const {
    onboardingButtonNext,
    onboardingButtonStart,
    onboardingHowItWorksTitle,
    onboardingHowItWorksDescription,
    onboardingBestResultsTitle,
    onboardingBestResultsDescription,
  } = useOnboardingStrings()

  const { currentSlide, nextSlide, previousSlide, getSlideState, isLastSlide, completeOnboarding } =
    useOnboardingSlides()

  const [isConsentValid, setIsConsentValid] = React.useState(false)

  const canProceed = (slide: number) => {
    if (slide === 2) {
      return isConsentValid
    }
    return true
  }

  const handleNext = () => {
    if (!canProceed(currentSlide)) return

    if (isLastSlide(currentSlide, 3)) {
      // Track completion
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
        <Slide state={getSlideState(0)}>
          <img
            alt="How it works guide"
            className={`${styles.image} ${styles.image_howItWorks}`}
            src="./images/onboarding-how-it-works.png"
          />

          <h2 className={`aiuta-title-m ${styles.title}`}>{onboardingHowItWorksTitle}</h2>
          <h3 className={`aiuta-label-regular ${styles.description}`}>
            {onboardingHowItWorksDescription}
          </h3>
        </Slide>

        <Slide state={getSlideState(1)}>
          <img
            alt="Best results guide"
            className={`${styles.image} ${styles.image_bestResults}`}
            src="./images/onboarding-best-results--desktop.png"
          />

          <h2 className={`aiuta-title-m ${styles.title}`}>{onboardingBestResultsTitle}</h2>
          <h3 className={`aiuta-label-regular ${styles.description}`}>
            {onboardingBestResultsDescription}
          </h3>
        </Slide>

        <Slide state={getSlideState(2)}>
          <Consent onValidationChange={setIsConsentValid} />
        </Slide>
      </div>

      <PrimaryButton disabled={!canProceed(currentSlide)} onClick={handleNext}>
        {isLastSlide(currentSlide, 3) ? onboardingButtonStart : onboardingButtonNext}
      </PrimaryButton>
    </main>
  )
}

import React, { useState } from 'react'
import { Slide, Carousel, Consent, PrimaryButton } from '@/components'
import {
  useOnboardingSlides,
  useOnboardingAnalytics,
  useSwipeGesture,
  useOnboardingStrings,
  useOnboardingImages,
} from '@/hooks'
import styles from './Onboarding.module.scss'

interface OnboardingMobileProps {
  onComplete: () => void
}

export const OnboardingMobile = ({ onComplete }: OnboardingMobileProps) => {
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()
  const {
    onboardingButtonNext,
    onboardingButtonStart,
    onboardingHowItWorksTitle,
    onboardingHowItWorksDescription,
    onboardingBestResultsTitle,
    onboardingBestResultsDescription,
  } = useOnboardingStrings()

  const { carouselItems, bestResultsMobileImage } = useOnboardingImages()

  const { currentSlide, nextSlide, previousSlide, getSlideState, isLastSlide, completeOnboarding } =
    useOnboardingSlides()

  const [isConsentValid, setIsConsentValid] = React.useState(false)

  const canProceed = (slide: number) => {
    if (slide === 2) {
      return isConsentValid
    }
    return true
  }

  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleNext = () => {
    if (!canProceed(currentSlide)) return

    if (currentSlide === 0 && carouselIndex < carouselItems.length - 1) {
      setCarouselIndex(carouselIndex + 1)
    } else if (isLastSlide(currentSlide, 3)) {
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
    if (currentSlide === 0 && carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1)
    } else if (currentSlide > 0) {
      previousSlide()
    }
  }

  const swipeHandlers = useSwipeGesture(({ direction }) => {
    if (direction === 'left') {
      handleNext()
    } else if (direction === 'right') {
      handlePrevious()
    } else if (currentSlide === 0) {
      if (direction === 'up' && carouselIndex < carouselItems.length - 1) {
        setCarouselIndex(carouselIndex + 1)
      } else if (direction === 'down' && carouselIndex > 0) {
        setCarouselIndex(carouselIndex - 1)
      }
    }
  })

  return (
    <main className={styles.onboarding} {...swipeHandlers}>
      <div className={styles.slides}>
        <Slide state={getSlideState(0)}>
          <h2 className={`aiuta-title-l ${styles.title}`}>{onboardingHowItWorksTitle}</h2>
          <h3 className={`aiuta-label-regular ${styles.description} ${styles.description_mobile}`}>
            {onboardingHowItWorksDescription}
          </h3>

          <Carousel
            items={carouselItems}
            activeIndex={carouselIndex}
            onItemChange={setCarouselIndex}
          />
        </Slide>

        <Slide state={getSlideState(1)}>
          <h2 className={`aiuta-title-l ${styles.title}`}>{onboardingBestResultsTitle}</h2>
          <h3 className={`aiuta-label-regular ${styles.description} ${styles.description_mobile}`}>
            {onboardingBestResultsDescription}
          </h3>

          <img
            alt="Best results guide"
            className={`${styles.image} ${styles.image_bestResults}`}
            src={bestResultsMobileImage}
          />
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

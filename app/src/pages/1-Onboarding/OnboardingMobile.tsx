import React, { useState } from 'react'
import { Slide, Carousel, Consent, PrimaryButton } from '@/components'
import { CarouselItem } from '@/components/onboarding/Carousel'
import {
  useOnboardingSlides,
  useOnboardingAnalytics,
  useSwipeGesture,
  useOnboardingStrings,
} from '@/hooks'
import styles from './Onboarding.module.scss'

interface OnboardingMobileProps {
  onComplete: () => void
}

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    imageUrl: './images/onboarding-carousel-1--image.png',
    thumbnailUrl: './images/onboarding-carousel-1--thumb.png',
  },
  {
    imageUrl: './images/onboarding-carousel-2--image.png',
    thumbnailUrl: './images/onboarding-carousel-2--thumb.png',
  },
  {
    imageUrl: './images/onboarding-carousel-3--image.png',
    thumbnailUrl: './images/onboarding-carousel-3--thumb.png',
  },
]

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

  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleNext = () => {
    if (!canProceed(currentSlide)) return

    if (currentSlide === 0 && carouselIndex < CAROUSEL_ITEMS.length - 1) {
      setCarouselIndex(carouselIndex + 1)
    } else if (isLastSlide(currentSlide, 3)) {
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
      if (direction === 'up' && carouselIndex < CAROUSEL_ITEMS.length - 1) {
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
            items={CAROUSEL_ITEMS}
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
            src="./images/onboarding-best-results--mobile.png"
          />
        </Slide>

        <Slide state={getSlideState(2)}>
          <Consent isChecked={isConsentChecked} onCheckChange={setIsConsentChecked} />
        </Slide>
      </div>

      <PrimaryButton disabled={!canProceed(currentSlide)} onClick={handleNext}>
        {isLastSlide(currentSlide, 3) ? onboardingButtonStart : onboardingButtonNext}
      </PrimaryButton>
    </main>
  )
}

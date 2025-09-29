import React, { useState } from 'react'
import { OnboardingSlide, OnboardingCarousel, Consent, PrimaryButton } from '@/components'
import { CarouselItem } from '@/components/onboarding/OnboardingCarousel'
import { useOnboardingSlides, useOnboardingAnalytics, useSwipeGesture } from '@/hooks'
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
        <OnboardingSlide state={getSlideState(0)}>
          <h2 className={`aiuta-title-l ${styles.title}`}>Try on before buying</h2>
          <h3 className={`aiuta-label-regular ${styles.description} ${styles.description_mobile}`}>
            Just upload your photo and see how it looks
          </h3>

          <OnboardingCarousel
            items={CAROUSEL_ITEMS}
            activeIndex={carouselIndex}
            onItemChange={setCarouselIndex}
          />
        </OnboardingSlide>

        <OnboardingSlide state={getSlideState(1)}>
          <h2 className={`aiuta-title-l ${styles.title}`}>For the best results</h2>
          <h3 className={`aiuta-label-regular ${styles.description} ${styles.description_mobile}`}>
            Use a photo with good lighting, stand straight a plain background
          </h3>

          <img
            alt="Best results guide"
            className={`${styles.image} ${styles.image_bestResults}`}
            src="./images/onboarding-best-results--mobile.png"
          />
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

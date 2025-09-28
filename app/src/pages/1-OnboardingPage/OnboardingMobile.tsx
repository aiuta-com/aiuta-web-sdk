import React, { useState } from 'react'
import { OnboardingSlide, OnboardingCarousel, Consent, PrimaryButton } from '@/components'
import { CarouselItem } from '@/components/onboarding/OnboardingCarousel'
import { useOnboardingSlides, useOnboardingAnalytics } from '@/hooks'
import styles from './Onboarding.module.scss'

interface OnboardingMobileProps {
  onComplete: () => void
}

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    imageUrl: './images/mobileFirstOnboarding.png',
    thumbnailUrl: './images/mobileFirstMini.png',
  },
  {
    imageUrl: './images/mobileMiddleOnboarding.png',
    thumbnailUrl: './images/mobileMiddleMini.png',
  },
  {
    imageUrl: './images/mobileLastOnboarding.png',
    thumbnailUrl: './images/mobileLastMini.png',
  },
]

export const OnboardingMobile = ({ onComplete }: OnboardingMobileProps) => {
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()

  const {
    currentSlide,
    isConsentChecked,
    setIsConsentChecked,
    nextSlide,
    getSlideState,
    isLastSlide,
    canProceed,
    completeOnboarding,
  } = useOnboardingSlides()

  const [carouselIndex, setCarouselIndex] = useState(0)

  const handleNext = () => {
    if (currentSlide === 0 && carouselIndex < CAROUSEL_ITEMS.length - 1) {
      // Navigate through carousel on first step
      setCarouselIndex(carouselIndex + 1)
    } else if (isLastSlide(currentSlide, 3)) {
      // Track consent and completion
      trackConsentsGiven()
      trackOnboardingFinished()
      completeOnboarding()
      onComplete()
    } else {
      nextSlide()
    }
  }

  return (
    <main className={styles.onboarding}>
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
            src="./images/mobileLastStepOnboarding.png"
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

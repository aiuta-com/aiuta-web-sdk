import React, { useState } from 'react'
import { OnboardingStep, OnboardingCarousel, Consent, PrimaryButton } from '@/components'
import { CarouselItem } from '@/components/features/onboarding/OnboardingCarousel'
import styles from './OnboardingMobile.module.scss'

interface OnboardingMobileProps {
  onComplete: () => void
}

const CAROUSEL_ITEMS: CarouselItem[] = [
  {
    imageUrl: './images/mobileFirstOnboarding.png',
    miniImageUrl: './images/mobileFirstMini.png',
    altText: 'First onboarding step',
  },
  {
    imageUrl: './images/mobileMiddleOnboarding.png',
    miniImageUrl: './images/mobileMiddleMini.png',
    altText: 'Middle onboarding step',
  },
  {
    imageUrl: './images/mobileLastOnboarding.png',
    miniImageUrl: './images/mobileLastMini.png',
    altText: 'Last onboarding step',
  },
]

export const OnboardingMobile = ({ onComplete }: OnboardingMobileProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [isConsentChecked, setIsConsentChecked] = useState(false)

  const handleNext = () => {
    if (currentStep === 0 && carouselIndex < CAROUSEL_ITEMS.length - 1) {
      // Navigate through carousel on first step
      setCarouselIndex(carouselIndex + 1)
    } else if (currentStep < 2) {
      // Move to next main step
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      onComplete()
    }
  }

  const getStepState = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'active'
    return 'pending'
  }

  return (
    <div className={styles.onboardingMobile}>
      <div className={styles.stepsContainer}>
        <OnboardingStep state={getStepState(0)}>
          <div className={styles.firstStepContent}>
            <div className={styles.titlesBox}>
              <h2 className={`aiuta-title-l ${styles.title}`}>Try on before buying</h2>
              <h3 className={`aiuta-label-regular ${styles.description}`}>
                Just upload your photo and see how it looks
              </h3>
            </div>
            <div className={styles.carouselContainer}>
              <OnboardingCarousel
                items={CAROUSEL_ITEMS}
                activeIndex={carouselIndex}
                onItemChange={setCarouselIndex}
              />
            </div>
          </div>
        </OnboardingStep>

        <OnboardingStep state={getStepState(1)}>
          <div className={styles.stepContent}>
            <div className={styles.titlesBox}>
              <h2 className={`aiuta-title-l ${styles.title}`}>For the best results</h2>
              <h3 className={`aiuta-label-regular ${styles.description}`}>
                Use a photo with good lighting, stand straight a plain background
              </h3>
            </div>
            <img
              alt="Best results guide"
              className={styles.stepImage}
              src="./images/mobileLastStepOnboarding.png"
            />
          </div>
        </OnboardingStep>

        <OnboardingStep state={getStepState(2)}>
          <div className={styles.consentContent}>
            <Consent isChecked={isConsentChecked} onCheckChange={setIsConsentChecked} />
          </div>
        </OnboardingStep>
      </div>

      <PrimaryButton disabled={currentStep === 2 && !isConsentChecked} onClick={handleNext}>
        {currentStep === 2 ? 'Start' : 'Next'}
      </PrimaryButton>
    </div>
  )
}

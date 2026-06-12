import React, { useState } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { Slide, Consent, PrimaryButton } from '@/components'
import {
  useOnboardingSlides,
  useOnboardingAnalytics,
  useSwipeGesture,
  useOnboardingStrings,
  useOnboardingImages,
} from '@/hooks'
import { pageIdForSlide } from '@/hooks/onboarding/useOnboardingSlides'
import type { OnboardingSlideId } from '@/utils/onboarding/onboardingFlow'
import type { AiutaMode } from '@lib/config'
import styles from './Onboarding.module.scss'

interface OnboardingSlidesProps {
  slides: OnboardingSlideId[]
  markSlideCompleted: (slideId: OnboardingSlideId) => AiutaMode | null
  onComplete: () => void
}

/**
 * Single responsive layout for every info slide: one reserved image slot,
 * title, description and the Next/Start button. Any decorations (checkmarks,
 * shadows, rounded corners) live inside the supplied image itself.
 * The consent slide keeps its own component and gates the button.
 */
export const OnboardingSlides = ({
  slides,
  markSlideCompleted,
  onComplete,
}: OnboardingSlidesProps) => {
  const isMobile = useAppSelector(isMobileSelector)
  const { trackConsentsGiven, trackOnboardingFinished } = useOnboardingAnalytics()
  const strings = useOnboardingStrings()
  const images = useOnboardingImages()

  const { currentSlideId, isLastSlide, nextSlide, previousSlide, getSlideState } =
    useOnboardingSlides(slides)

  const [isConsentValid, setIsConsentValid] = useState(false)

  const canProceed = currentSlideId !== 'consent' || isConsentValid

  const infoSlideContent = (slideId: OnboardingSlideId) => {
    switch (slideId) {
      case 'howItWorks':
        return {
          image: isMobile ? images.howItWorksMobileImage : images.howItWorksDesktopImage,
          title: strings.onboardingHowItWorksTitle,
          description: strings.onboardingHowItWorksDescription,
        }
      case 'bestResults':
        return {
          image: isMobile ? images.bestResultsMobileImage : images.bestResultsDesktopImage,
          title: strings.onboardingBestResultsTitle,
          description: strings.onboardingBestResultsDescription,
        }
      case 'shoesBestResults':
        return {
          image: images.shoesBestResultsImage,
          title: strings.onboardingShoesBestResultsTitle,
          description: strings.onboardingShoesBestResultsDescription,
        }
      default:
        return null
    }
  }

  const handleNext = () => {
    if (!canProceed) return

    if (currentSlideId === 'consent') {
      trackConsentsGiven()
    }

    const completedMode = markSlideCompleted(currentSlideId)
    if (completedMode) {
      trackOnboardingFinished(pageIdForSlide(currentSlideId))
    }

    if (isLastSlide) {
      onComplete()
    } else {
      nextSlide()
    }
  }

  const swipeHandlers = useSwipeGesture(({ direction }) => {
    if (direction === 'left') {
      handleNext()
    } else if (direction === 'right') {
      previousSlide()
    }
  })

  return (
    <main
      className={`${styles.onboarding} ${isMobile ? styles.onboarding_mobile : ''}`}
      {...swipeHandlers}
    >
      <div className={`${styles.slides} ${isMobile ? styles.slides_mobile : ''}`}>
        {slides.map((slideId, index) => {
          const content = infoSlideContent(slideId)
          return (
            <Slide key={slideId} state={getSlideState(index)}>
              {content ? (
                <>
                  <img
                    alt={content.title}
                    className={`${styles.image} ${isMobile ? styles.image_mobile : ''}`}
                    src={content.image}
                    draggable={false}
                  />
                  <h2 className={`${isMobile ? 'aiuta-title-m' : 'aiuta-title-l'} ${styles.title}`}>
                    {content.title}
                  </h2>
                  <h3 className={`aiuta-label-regular ${styles.description}`}>
                    {content.description}
                  </h3>
                </>
              ) : (
                <Consent onValidationChange={setIsConsentValid} />
              )}
            </Slide>
          )
        })}
      </div>

      <PrimaryButton disabled={!canProceed} onClick={handleNext}>
        {isLastSlide ? strings.onboardingButtonStart : strings.onboardingButtonNext}
      </PrimaryButton>
    </main>
  )
}

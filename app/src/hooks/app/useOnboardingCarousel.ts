import { useState, useCallback } from 'react'
import { CarouselItem } from '@/components/OnboardingCarousel'

export interface OnboardingCarouselConfig {
  /** Initial carousel index */
  initialIndex?: number
  /** Carousel items */
  items: CarouselItem[]
  /** Whether to auto-advance to next step after carousel completion */
  autoAdvance?: boolean
}

export const useOnboardingCarousel = (config: OnboardingCarouselConfig) => {
  const { initialIndex = 0, items, autoAdvance = true } = config

  const [carouselIndex, setCarouselIndex] = useState(initialIndex)

  const nextCarouselItem = useCallback(() => {
    setCarouselIndex((prev) => Math.min(prev + 1, items.length - 1))
  }, [items.length])

  const previousCarouselItem = useCallback(() => {
    setCarouselIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToCarouselItem = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setCarouselIndex(index)
      }
    },
    [items.length],
  )

  const isFirstCarouselItem = carouselIndex === 0
  const isLastCarouselItem = carouselIndex === items.length - 1

  const canAdvanceCarousel = !isLastCarouselItem
  const shouldAutoAdvance = autoAdvance && isLastCarouselItem

  // Helper to determine if we should advance carousel or move to next step
  const handleNext = useCallback(
    (onStepAdvance: () => void) => {
      if (canAdvanceCarousel) {
        nextCarouselItem()
      } else if (shouldAutoAdvance) {
        onStepAdvance()
      }
    },
    [canAdvanceCarousel, shouldAutoAdvance, nextCarouselItem],
  )

  return {
    // State
    carouselIndex,
    isFirstCarouselItem,
    isLastCarouselItem,
    canAdvanceCarousel,
    shouldAutoAdvance,

    // Actions
    setCarouselIndex,
    nextCarouselItem,
    previousCarouselItem,
    goToCarouselItem,
    handleNext,
  }
}

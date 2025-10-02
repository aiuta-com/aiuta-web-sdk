import { useMemo } from 'react'
import { useRpc } from '@/contexts'
import type { CarouselItem } from '@/components/onboarding/Carousel'

// Default carousel items as fallback
const DEFAULT_CAROUSEL_ITEMS: CarouselItem[] = [
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

/**
 * Hook for getting onboarding images from configuration with fallbacks
 */
export const useOnboardingImages = () => {
  const rpc = useRpc()

  const onboardingConfig = rpc.config.features?.onboarding
  const howItWorksImages = onboardingConfig?.howItWorksPage?.images
  const bestResultsImages = onboardingConfig?.bestResultsPage?.images

  const carouselItems = useMemo(() => {
    const configItems = howItWorksImages?.onboardingHowItWorksItems

    // If no config items or empty array, use defaults
    if (!configItems || configItems.length === 0) {
      return DEFAULT_CAROUSEL_ITEMS
    }

    // Map config items to CarouselItem format
    return configItems.map((item, index) => ({
      imageUrl: item.itemPhoto ?? DEFAULT_CAROUSEL_ITEMS[index]?.imageUrl ?? '',
      thumbnailUrl: item.itemPreview ?? DEFAULT_CAROUSEL_ITEMS[index]?.thumbnailUrl ?? '',
    }))
  }, [howItWorksImages?.onboardingHowItWorksItems])

  return {
    carouselItems,
    // How It Works desktop image
    howItWorksDesktopImage:
      howItWorksImages?.onboardingHowItWorksDesktop ?? './images/onboarding-how-it-works.png',
    // Best Results images
    bestResultsDesktopImage:
      bestResultsImages?.onboardingBestResultsDesktop ??
      './images/onboarding-best-results--desktop.png',
    bestResultsMobileImage:
      bestResultsImages?.onboardingBestResultsMobile ??
      './images/onboarding-best-results--mobile.png',
  }
}

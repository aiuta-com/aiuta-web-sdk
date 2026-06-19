import { useRpc } from '@/contexts'

/**
 * Hook for getting onboarding images from configuration with fallbacks.
 *
 * Every slide reserves a single image slot — any decorations (checkmarks,
 * shadows, rounded corners) live inside the supplied image itself.
 */
export const useOnboardingImages = () => {
  const rpc = useRpc()

  const onboardingConfig = rpc.config.features?.onboarding
  const howItWorksImages = onboardingConfig?.howItWorksPage?.images
  const bestResultsImages = onboardingConfig?.bestResultsPage?.images
  const shoesImages = rpc.config.modes?.shoes?.onboardingShoesPage?.images

  // The built-in defaults are a single image per slide; the config can still
  // override desktop and mobile separately
  return {
    // How It Works — the built-in default is an animated WebP (a looped
    // outfit-swap that plays as a plain image, so it's not subject to video
    // autoplay restrictions). A partner-configured image overrides it.
    howItWorksDesktopImage:
      howItWorksImages?.onboardingHowItWorksDesktop ?? './images/onboarding-how-it-works.webp',
    howItWorksMobileImage:
      howItWorksImages?.onboardingHowItWorksMobile ?? './images/onboarding-how-it-works.webp',
    // Best Results images
    bestResultsDesktopImage:
      bestResultsImages?.onboardingBestResultsDesktop ?? './images/onboarding-best-results.png',
    bestResultsMobileImage:
      bestResultsImages?.onboardingBestResultsMobile ?? './images/onboarding-best-results.png',
    // Shoes Best Results image
    shoesBestResultsImage:
      shoesImages?.onboardingShoesBestResults ?? './images/onboarding-shoes-best-results.png',
  }
}

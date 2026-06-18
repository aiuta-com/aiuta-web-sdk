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
    // How It Works images
    howItWorksDesktopImage:
      howItWorksImages?.onboardingHowItWorksDesktop ?? './images/onboarding-how-it-works.png',
    howItWorksMobileImage:
      howItWorksImages?.onboardingHowItWorksMobile ?? './images/onboarding-how-it-works.png',
    // Built-in How It Works video, shown in place of the default image (the png
    // is its poster / fallback). A partner-configured image overrides it — then
    // no video plays.
    howItWorksVideo: './videos/onboarding-how-it-works.m4v',
    howItWorksHasCustomImage: Boolean(
      howItWorksImages?.onboardingHowItWorksDesktop ?? howItWorksImages?.onboardingHowItWorksMobile,
    ),
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

import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Onboarding feature strings with fallbacks
 */
export const useOnboardingStrings = () => {
  const rpc = useRpc()

  const onboardingConfig = rpc.config.features?.onboarding
  const buttonStrings = onboardingConfig?.strings
  const howItWorksStrings = onboardingConfig?.howItWorksPage?.strings
  const bestResultsStrings = onboardingConfig?.bestResultsPage?.strings

  return {
    // Button strings
    onboardingButtonNext: buttonStrings?.onboardingButtonNext ?? 'Next',
    onboardingButtonStart: buttonStrings?.onboardingButtonStart ?? 'Start',

    // How It Works page strings
    onboardingHowItWorksTitle:
      howItWorksStrings?.onboardingHowItWorksTitle ?? 'Try on before buying',
    onboardingHowItWorksDescription:
      howItWorksStrings?.onboardingHowItWorksDescription ??
      'Upload a photo and see how items look on you',

    // Best Results page strings
    onboardingBestResultsTitle:
      bestResultsStrings?.onboardingBestResultsTitle ?? 'For the best results',
    onboardingBestResultsDescription:
      bestResultsStrings?.onboardingBestResultsDescription ??
      'Use a photo with good lighting, stand straight a plain background',
  }
}

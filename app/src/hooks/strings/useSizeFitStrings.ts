import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Size & Fit feature strings with fallbacks
 */
export const useSizeFitStrings = () => {
  const rpc = useRpc()

  const strings = rpc.config.features?.sizeFit?.strings

  return {
    sizeFitButton: strings?.sizeFitButton ?? 'Find your size',
    // Survey — step 1
    sizeFitSurveyTitle: strings?.sizeFitSurveyTitle ?? 'Find your size',
    sizeFitGenderMale: strings?.sizeFitGenderMale ?? 'Male',
    sizeFitGenderFemale: strings?.sizeFitGenderFemale ?? 'Female',
    sizeFitAgeLabel: strings?.sizeFitAgeLabel ?? 'Age',
    sizeFitHeightLabel: strings?.sizeFitHeightLabel ?? 'Height',
    sizeFitWeightLabel: strings?.sizeFitWeightLabel ?? 'Weight',
    sizeFitPrivacyDisclaimerHtml:
      strings?.sizeFitPrivacyDisclaimerHtml ?? 'Your data will be processed securely',
    // Survey — step 2 (body shapes)
    sizeFitBellyTitle: strings?.sizeFitBellyTitle ?? 'Belly shape',
    sizeFitBellyFlatter: strings?.sizeFitBellyFlatter ?? 'Flatter',
    sizeFitBellyAverage: strings?.sizeFitBellyAverage ?? 'Average',
    sizeFitBellyFull: strings?.sizeFitBellyFull ?? 'Full',
    sizeFitHipsTitle: strings?.sizeFitHipsTitle ?? 'Hips shape',
    sizeFitHipsStraight: strings?.sizeFitHipsStraight ?? 'Straight',
    sizeFitHipsAverage: strings?.sizeFitHipsAverage ?? 'Average',
    sizeFitHipsWide: strings?.sizeFitHipsWide ?? 'Wide',
    // Survey — step 3 (bra, female only)
    sizeFitBraTitle: strings?.sizeFitBraTitle ?? 'Bra size',
    sizeFitBraBandTitle: strings?.sizeFitBraBandTitle ?? 'Chest circumference',
    sizeFitBraCupTitle: strings?.sizeFitBraCupTitle ?? 'Bra cup',
    // Buttons
    sizeFitButtonNext: strings?.sizeFitButtonNext ?? 'Next',
    sizeFitButtonFindMySize: strings?.sizeFitButtonFindMySize ?? 'Find my size',
    // Results
    sizeFitResultsTitle: strings?.sizeFitResultsTitle ?? 'Recommended size',
    sizeFitBestFit: strings?.sizeFitBestFit ?? 'Best fit',
    sizeFitParametersTitle: strings?.sizeFitParametersTitle ?? 'Parameters',
    sizeFitButtonChange: strings?.sizeFitButtonChange ?? 'Change',
    sizeFitButtonGotIt: strings?.sizeFitButtonGotIt ?? 'Got it',
    sizeFitNoResultTitle: strings?.sizeFitNoResultTitle ?? 'Sorry!',
    sizeFitNoResultDescription:
      strings?.sizeFitNoResultDescription ??
      "This item is designed for a different body type or gender. We can't recommend a size",
  }
}

import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Try On feature strings with fallbacks
 */
export const useTryOnStrings = () => {
  const rpc = useRpc()

  const tryOnConfig = rpc.config.features?.tryOn
  const strings = tryOnConfig?.strings
  const loadingPageStrings = tryOnConfig?.loadingPage?.strings
  const inputValidationStrings = tryOnConfig?.inputImageValidation?.strings
  const fitDisclaimerStrings = tryOnConfig?.fitDisclaimer?.strings
  const generationsHistoryStrings = tryOnConfig?.generationsHistory?.strings

  return {
    // Main Try On strings
    tryOnPageTitle: strings?.tryOnPageTitle ?? 'Virtual Try-On',
    tryOn: strings?.tryOn ?? 'Try On',

    // Loading page strings
    tryOnLoadingStatusUploadingImage:
      loadingPageStrings?.tryOnLoadingStatusUploadingImage ?? 'Uploading image',
    tryOnLoadingStatusScanningBody:
      loadingPageStrings?.tryOnLoadingStatusScanningBody ?? 'Scanning your body',
    tryOnLoadingStatusGeneratingOutfit:
      loadingPageStrings?.tryOnLoadingStatusGeneratingOutfit ?? 'Generating outfit',

    // Input validation strings
    invalidInputImageDescription:
      inputValidationStrings?.invalidInputImageDescription ??
      "We couldn't detect anyone in this photo. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.",
    invalidInputImageChangePhotoButton:
      inputValidationStrings?.invalidInputImageChangePhotoButton ?? 'Change photo',

    // Specific abort reason messages
    noPeopleDetectedDescription:
      inputValidationStrings?.noPeopleDetectedDescription ??
      inputValidationStrings?.invalidInputImageDescription ??
      "We couldn't detect anyone in this photo. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.",
    tooManyPeopleDetectedDescription:
      inputValidationStrings?.tooManyPeopleDetectedDescription ??
      inputValidationStrings?.invalidInputImageDescription ??
      'We detected multiple people in this photo. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.',
    childDetectedDescription:
      inputValidationStrings?.childDetectedDescription ??
      inputValidationStrings?.invalidInputImageDescription ??
      'It looks like this photo might be of a child. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.',

    // Fit disclaimer strings
    fitDisclaimerTitle:
      fitDisclaimerStrings?.fitDisclaimerTitle ?? 'Results may vary from real-life fit',

    // Generations history strings
    generationsHistoryPageTitle:
      generationsHistoryStrings?.generationsHistoryPageTitle ?? 'History',
  }
}

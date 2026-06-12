import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'

/**
 * Hook for getting localized Try On feature strings with fallbacks
 */
export const useTryOnStrings = () => {
  const rpc = useRpc()
  const mode = useAppSelector(tryOnModeSelector)

  const tryOnConfig = rpc.config.features?.tryOn
  const strings = tryOnConfig?.strings
  const loadingPageStrings = tryOnConfig?.loadingPage?.strings
  const inputValidationStrings = tryOnConfig?.inputImageValidation?.strings
  const generationsHistoryStrings = tryOnConfig?.generationsHistory?.strings
  const shoesValidationStrings = rpc.config.modes?.shoes?.tryOn?.inputImageValidation?.strings

  // The backend reports one INSUFFICIENT_TARGET_AREA code for every product
  // kind (a hat on a photo without a head, shoes without feet, ...) — the
  // user-facing message is derived from the SDK mode instead
  const insufficientTargetAreaDescription =
    mode === 'shoes'
      ? (shoesValidationStrings?.insufficientTargetAreaDescription ??
        "We couldn't clearly see your feet in this photo. Please upload a photo where your feet are fully visible.")
      : (inputValidationStrings?.insufficientTargetAreaDescription ??
        "We couldn't process this photo because the area to try on isn't clearly visible. Please upload a photo where it is fully in view.")

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
      "We couldn't detect anyone in this photo. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.",
    tooManyPeopleDetectedDescription:
      inputValidationStrings?.tooManyPeopleDetectedDescription ??
      'We detected multiple people in this photo. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.',
    childDetectedDescription:
      inputValidationStrings?.childDetectedDescription ??
      'It looks like this photo might be of a child. For best results, please upload a well-lit photo of an adult standing straight in front of a pale background.',
    internalRestrictionDescription:
      inputValidationStrings?.internalRestrictionDescription ??
      "We couldn't process this request because the resulting image didn't meet our safety and content guidelines. Please try again using a different photo.",
    insufficientTargetAreaDescription,

    // Generations history strings
    generationsHistoryPageTitle:
      generationsHistoryStrings?.generationsHistoryPageTitle ?? 'History',
  }
}

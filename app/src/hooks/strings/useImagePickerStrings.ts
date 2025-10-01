import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Image Picker feature strings with fallbacks
 */
export const useImagePickerStrings = () => {
  const rpc = useRpc()

  const imagePickerConfig = rpc.config.features?.imagePicker
  const mainStrings = imagePickerConfig?.strings
  const uploadsHistoryStrings = imagePickerConfig?.uploadsHistory?.strings

  return {
    // Main Image Picker strings
    imagePickerButtonUploadImage:
      mainStrings?.imagePickerButtonUploadImage ?? 'Upload a photo of you',
    nextButton: mainStrings?.nextButton ?? 'Next',

    // Uploads History strings
    uploadsHistoryButtonNewPhoto:
      uploadsHistoryStrings?.uploadsHistoryButtonNewPhoto ?? '+ Upload new photo',
    uploadsHistoryTitle: uploadsHistoryStrings?.uploadsHistoryTitle ?? 'Previously used photos',
    uploadsHistoryButtonChangePhoto:
      uploadsHistoryStrings?.uploadsHistoryButtonChangePhoto ?? 'Change photo',
  }
}

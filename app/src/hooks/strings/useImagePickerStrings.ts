import { useRpc } from '@/contexts'

/**
 * Hook for getting localized Image Picker feature strings with fallbacks
 */
export const useImagePickerStrings = () => {
  const rpc = useRpc()

  const imagePickerConfig = rpc.config.features?.imagePicker
  const mainStrings = imagePickerConfig?.strings
  const uploadsHistoryStrings = imagePickerConfig?.uploadsHistory?.strings
  const qrUploadStrings = imagePickerConfig?.qrUpload?.strings
  const qrPromptStrings = imagePickerConfig?.qrPrompt?.strings

  return {
    // Main Image Picker strings
    imagePickerButtonUploadImage:
      mainStrings?.imagePickerButtonUploadImage ?? 'Upload a photo of you',

    // Uploads History strings
    uploadsHistoryButtonNewPhoto:
      uploadsHistoryStrings?.uploadsHistoryButtonNewPhoto ?? '+ Upload new photo',
    uploadsHistoryTitle: uploadsHistoryStrings?.uploadsHistoryTitle ?? 'Previously used photos',
    uploadsHistoryButtonChangePhoto:
      uploadsHistoryStrings?.uploadsHistoryButtonChangePhoto ?? 'Change photo',

    // QR Upload strings
    qrUploadNextButton: qrUploadStrings?.qrUploadNextButton ?? 'Next',
    qrUploadSuccessTitle: qrUploadStrings?.qrUploadSuccessTitle ?? 'Your photo has been uploaded',
    qrUploadNextHint: qrUploadStrings?.qrUploadNextHint ?? 'It will appear within a few seconds',

    // QR Prompt strings
    qrPromptHint: qrPromptStrings?.qrPromptHint ?? 'Scan the QR code',
    qrPromptOr: qrPromptStrings?.qrPromptOr ?? 'Or',
    qrPromptUploadButton: qrPromptStrings?.qrPromptUploadButton ?? 'Click here to upload',
  }
}

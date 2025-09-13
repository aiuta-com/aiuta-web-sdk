import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { configSlice } from '@/store/slices/configSlice'
import { aiutaEndpointDataSelector } from '@/store/slices/configSlice/selectors'
import { TryOnApiService, InputImage } from '@/utils/api/tryOnApiService'
import { usePhotoGallery } from '@/hooks/tryOn/usePhotoGallery'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'

export const useImageUpload = () => {
  const dispatch = useAppDispatch()
  const endpointData = useAppSelector(aiutaEndpointDataSelector)
  const { addPhotoToGallery } = usePhotoGallery()
  const { trackUploadError } = useTryOnAnalytics()

  const uploadImage = async (
    file: File,
    onSuccess?: (result: InputImage) => void,
  ): Promise<void> => {
    if (!endpointData) return

    try {
      dispatch(tryOnSlice.actions.setIsGenerating(true))
      dispatch(configSlice.actions.setIsShowFooter(true))

      const result = await TryOnApiService.uploadImage(file, endpointData)

      if (result.owner_type === 'user') {
        const uploadedImage: InputImage = { id: result.id, url: result.url }

        // Update file state with local URL for preview
        const localUrl = URL.createObjectURL(file)
        dispatch(
          tryOnSlice.actions.setCurrentImage({
            id: uploadedImage.id,
            url: uploadedImage.url,
            localUrl,
          }),
        )

        // Add to gallery
        addPhotoToGallery(uploadedImage)

        onSuccess?.(uploadedImage)
      } else if (result.error) {
        handleUploadError(result.error)
      }
    } catch (error: any) {
      handleUploadError(error.message)
    }
  }

  const handleUploadError = (errorMessage: string) => {
    dispatch(tryOnSlice.actions.setIsGenerating(false))
    dispatch(
      errorSnackbarSlice.actions.showErrorSnackbar({
        retryButtonText: 'Try again',
        errorMessage: 'Something went wrong. Please try again later.',
      }),
    )

    trackUploadError(errorMessage, errorMessage)
  }

  return {
    uploadImage,
  }
}

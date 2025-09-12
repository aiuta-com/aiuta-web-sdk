import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
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
      dispatch(generationsSlice.actions.setIsGenerating(true))
      dispatch(configSlice.actions.setIsShowFooter(true))

      const result = await TryOnApiService.uploadImage(file, endpointData)

      if (result.owner_type === 'user') {
        const uploadedImage: InputImage = { id: result.id, url: result.url }

        // Update file state with local URL for preview
        dispatch(
          uploadsSlice.actions.setCurrentImage({
            ...uploadedImage,
            file,
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
    dispatch(generationsSlice.actions.setIsGenerating(false))
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

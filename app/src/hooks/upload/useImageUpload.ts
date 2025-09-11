import { useAppSelector, useAppDispatch } from '@/store/store'
import { fileSlice } from '@/store/slices/fileSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { configSlice } from '@/store/slices/configSlice'
import { generateSlice } from '@/store/slices/generateSlice'
import { aiutaEndpointDataSelector } from '@/store/slices/configSlice/selectors'
import { TryOnApiService, UploadedImage } from '@/utils/api/tryOnApiService'
import { usePhotoGallery } from '@/hooks/tryOn/usePhotoGallery'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'

export const useImageUpload = () => {
  const dispatch = useAppDispatch()
  const endpointData = useAppSelector(aiutaEndpointDataSelector)
  const { addPhotoToGallery } = usePhotoGallery()
  const { trackUploadError } = useTryOnAnalytics()

  const uploadImage = async (
    file: File,
    onSuccess?: (result: UploadedImage) => void,
  ): Promise<void> => {
    if (!endpointData) return

    try {
      dispatch(generateSlice.actions.setIsStartGeneration(true))
      dispatch(configSlice.actions.setIsShowFooter(true))

      const result = await TryOnApiService.uploadImage(file, endpointData)

      if (result.owner_type === 'user') {
        const uploadedImage: UploadedImage = { id: result.id, url: result.url }

        // Update file state with local URL for preview
        dispatch(
          fileSlice.actions.setUploadViewFile({
            ...uploadedImage,
            file,
            localUrl: URL.createObjectURL(file),
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
    dispatch(generateSlice.actions.setIsStartGeneration(false))
    dispatch(
      errorSnackbarSlice.actions.setShowErrorSnackbar({
        type: 'error',
        isShow: true,
        buttonText: 'Try again',
        content: 'Something went wrong, please try again later.',
      }),
    )

    trackUploadError(errorMessage, errorMessage)
  }

  return {
    uploadImage,
  }
}

import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { alertSlice } from '@lib/redux/slices/alertSlice'
import { configSlice } from '@lib/redux/slices/configSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'
import { aiutaEndpointDataSelector } from '@lib/redux/slices/configSlice/selectors'
import { TryOnApiService, UploadedImage } from '../../utils/api/tryOnApiService'
import { usePhotoGallery } from '../tryOn/usePhotoGallery'
import { useTryOnAnalytics } from '../tryOn/useTryOnAnalytics'

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
      alertSlice.actions.setShowAlert({
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

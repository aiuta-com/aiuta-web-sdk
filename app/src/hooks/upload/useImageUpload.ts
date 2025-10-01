import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { TryOnApiService, InputImage } from '@/utils/api/tryOnApiService'
import { fixImageOrientation } from '@/utils'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'

interface UseImageUploadOptions {
  withinGenerationFlow?: boolean
}

export const useImageUpload = ({ withinGenerationFlow = false }: UseImageUploadOptions = {}) => {
  const dispatch = useAppDispatch()
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const { trackUploadError } = useTryOnAnalytics()

  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (
    file: File,
    onSuccess?: (result: InputImage) => void,
  ): Promise<void> => {
    if (!productId || (!apiKey && !subscriptionId)) return

    const endpointData = { apiKey, subscriptionId, skuId: productId }

    try {
      setIsUploading(true)

      // Only set generating state if within generation flow
      if (withinGenerationFlow) {
        dispatch(tryOnSlice.actions.setIsGenerating(true))
      }

      // Try to fix image orientation, fallback to original if fails
      let fileToUpload = file
      let localUrlForPreview = URL.createObjectURL(file)

      try {
        const fixed = await fixImageOrientation(file, {
          outputMime: 'image/jpeg',
        })

        // Create corrected File from fixed blob
        fileToUpload = new File([fixed.blob], file.name, {
          type: fixed.mime,
          lastModified: file.lastModified,
        })

        // Use corrected image for preview
        localUrlForPreview = fixed.objectUrl
      } catch (orientationError) {
        console.warn('Failed to fix image orientation, using original:', orientationError)
        // fileToUpload and localUrlForPreview already set to original values
      }

      const result = await TryOnApiService.uploadImage(fileToUpload, endpointData)

      if (result.owner_type === 'user') {
        const uploadedImage: InputImage = { id: result.id, url: result.url }

        // Update file state with local URL for preview
        dispatch(
          tryOnSlice.actions.setCurrentImage({
            id: uploadedImage.id,
            url: uploadedImage.url,
            localUrl: localUrlForPreview, // Use corrected or original image for preview
          }),
        )

        onSuccess?.(uploadedImage)

        // Auto-reset upload state after a short delay to allow navigation
        setTimeout(() => setIsUploading(false), 100)
      } else if (result.error) {
        setIsUploading(false)
        handleUploadError(result.error)
      }
    } catch (error: any) {
      setIsUploading(false)
      handleUploadError(error.message)
    }
  }

  const handleUploadError = (errorMessage: string) => {
    // Only reset generating state if within generation flow
    if (withinGenerationFlow) {
      dispatch(tryOnSlice.actions.setIsGenerating(false))
    }

    dispatch(errorSnackbarSlice.actions.showErrorSnackbar())

    trackUploadError(errorMessage, errorMessage)
  }

  return {
    uploadImage,
    isUploading,
  }
}

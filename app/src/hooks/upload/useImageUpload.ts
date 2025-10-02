import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { TryOnApiService, InputImage } from '@/utils/api/tryOnApiService'
import { resizeAndConvertImage } from '@/utils'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'
import { TryOnAnalyticsService } from '@/utils/analytics/tryOnAnalyticsService'
import { useRpc } from '@/contexts'

interface UseImageUploadOptions {
  withinGenerationFlow?: boolean
}

export const useImageUpload = ({ withinGenerationFlow = false }: UseImageUploadOptions = {}) => {
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const { trackUploadError } = useTryOnAnalytics()

  const analytics = new TryOnAnalyticsService(rpc, productId)

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

      const processed = await resizeAndConvertImage(file)
      const fileToUpload = new File([processed.blob], file.name, {
        type: processed.mime,
        lastModified: file.lastModified,
      })

      const localUrlForPreview = processed.objectUrl

      const result = await TryOnApiService.uploadImage(fileToUpload, endpointData)

      if (result.owner_type === 'user') {
        const uploadedImage: InputImage = { id: result.id, url: result.url }

        // Update file state with local URL for preview
        dispatch(
          tryOnSlice.actions.setCurrentImage({
            id: uploadedImage.id,
            url: uploadedImage.url,
            localUrl: localUrlForPreview,
          }),
        )

        // Track successful photo upload
        analytics.trackPhotoUploaded()

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

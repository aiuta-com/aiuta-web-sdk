import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector, selectedImageSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'
import { TryOnApiService, InputImage, GenerationResult } from '@/utils/api/tryOnApiService'
import { isNewImage, isInputImage } from '@/models'
import { resizeAndConvertImage } from '@/utils'
import { useTryOnAnalytics } from './useTryOnAnalytics'
import { useUploadsGallery } from '@/hooks/gallery/useUploadsGallery'

export const useTryOnGeneration = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpc()

  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const selectedImage = useAppSelector(selectedImageSelector)

  // Create combined endpoint data for API calls
  const endpointData = {
    apiKey,
    subscriptionId,
    skuId: productId,
  }

  const {
    trackTryOnInitiated,
    trackTryOnFinished,
    trackTryOnError,
    trackTryOnAborted,
    trackUploadError,
  } = useTryOnAnalytics()

  // Get recent photo function from uploads gallery
  const { getRecentPhoto } = useUploadsGallery()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const usedImageRef = useRef<InputImage | null>(null)

  const clearGenerationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    usedImageRef.current = null
    dispatch(tryOnSlice.actions.setOperationId(null))
  }, [dispatch])

  const handleGenerationSuccess = useCallback(
    (result: GenerationResult) => {
      if (result.generated_images && result.generated_images.length > 0) {
        const { id, url } = result.generated_images[0]

        dispatch(tryOnSlice.actions.setGeneratedImageUrl(url))

        // Common logic after navigation
        const finalizeGeneration = () => {
          navigate('/results')
          dispatch(tryOnSlice.actions.setIsGenerating(false))

          // After navigation, add images to history and update selectedImage
          dispatch(generationsSlice.actions.addGeneratedImage({ id, url }))

          const imageToStore = usedImageRef.current
          if (imageToStore && isInputImage(imageToStore)) {
            // Add to uploads history
            dispatch(
              uploadsSlice.actions.addInputImage({
                id: imageToStore.id,
                url: imageToStore.url,
              }),
            )

            // Replace selectedImage (NewImage) with InputImage from server
            // This ensures deletion from history will correctly clear selectedImage
            dispatch(tryOnSlice.actions.setSelectedImage(imageToStore))
          }
        }

        // Preload the generated image for instant display on ResultsPage
        const img = new Image()
        img.onload = finalizeGeneration
        img.onerror = finalizeGeneration // Still navigate if preload fails
        img.src = url

        trackTryOnFinished()
        clearGenerationInterval()
      }
    },
    [dispatch, navigate, trackTryOnFinished, clearGenerationInterval],
  )

  const handleGenerationError = useCallback(
    (result: GenerationResult) => {
      clearGenerationInterval()
      dispatch(tryOnSlice.actions.setIsGenerating(false))

      dispatch(errorSnackbarSlice.actions.showErrorSnackbar())

      trackTryOnError(result.status, result.error || 'Unknown error')
    },
    [dispatch, trackTryOnError, clearGenerationInterval],
  )

  const handleGenerationAborted = useCallback(
    (result: GenerationResult) => {
      clearGenerationInterval()
      dispatch(tryOnSlice.actions.setIsGenerating(false))
      dispatch(tryOnSlice.actions.setIsAborted(true))

      trackTryOnAborted(result.error || 'No people detected in photo')
    },
    [dispatch, trackTryOnAborted, clearGenerationInterval],
  )

  const pollGenerationStatus = useCallback(
    async (operationId: string) => {
      if (!endpointData) return

      try {
        const result = await TryOnApiService.getGenerationResult(operationId, endpointData)

        switch (result.status) {
          case 'SUCCESS':
            handleGenerationSuccess(result)
            break
          case 'FAILED':
          case 'CANCELLED':
            handleGenerationError(result)
            break
          case 'ABORTED':
            handleGenerationAborted(result)
            break
          default:
            // Continue waiting for PENDING status
            break
        }
      } catch (error) {
        console.error('Generation polling error:', error)
      }
    },
    [endpointData, handleGenerationSuccess, handleGenerationError, handleGenerationAborted],
  )

  const createOperationWithJwt = useCallback(
    async (uploadedImageId: string): Promise<string | null> => {
      if (!endpointData || !rpc || !('getJwt' in rpc.config.auth)) return null

      try {
        const jwtToken = await rpc.config.auth.getJwt({ uploaded_image_id: uploadedImageId })

        if (typeof jwtToken !== 'string' || jwtToken.length === 0) {
          trackTryOnError('authorizationFailed', 'authorizationFailed')
          return null
        }

        const result = await TryOnApiService.createOperation(
          uploadedImageId,
          endpointData,
          jwtToken,
        )

        if (result.operation_id) {
          return result.operation_id
        } else {
          trackTryOnError('operation_id_is_missing', 'operation_id_is_missing')
          return null
        }
      } catch (error: any) {
        trackTryOnError('requestOperationFailed', error.message)
        return null
      }
    },
    [endpointData, rpc, trackTryOnError],
  )

  const createOperationWithoutJwt = useCallback(
    async (uploadedImageId: string): Promise<string | null> => {
      if (!endpointData) return null

      try {
        const result = await TryOnApiService.createOperation(uploadedImageId, endpointData)
        return result.operation_id || null
      } catch (error: any) {
        trackTryOnError('requestOperationFailed', error.message)
        return null
      }
    },
    [endpointData, trackTryOnError],
  )

  const startTryOn = useCallback(async (): Promise<void> => {
    if (!endpointData) {
      console.error('Endpoints info is missing')
      return
    }

    // Determine image for try-on: use selectedImage from Redux or get recent from history
    let targetImage = selectedImage || getRecentPhoto()

    if (!targetImage) {
      console.error('No image selected for try-on')
      return
    }

    // Track process start
    trackTryOnInitiated()

    // Update state
    dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
    dispatch(tryOnSlice.actions.setIsGenerating(true))

    let uploadedImage: InputImage

    // Step 1: Upload image if it's a NewImage (local file)
    if (isNewImage(targetImage)) {
      try {
        dispatch(tryOnSlice.actions.setGenerationStage('uploading'))

        // Process and upload the file
        const processedFile = await resizeAndConvertImage(targetImage.file)
        const uploadResult = await TryOnApiService.uploadImage(processedFile, endpointData)

        if (uploadResult.owner_type !== 'user' || !uploadResult.id) {
          throw new Error(uploadResult.error || 'Upload failed')
        }

        uploadedImage = { id: uploadResult.id, url: uploadResult.url }

        // Update selectedImage in Redux to the uploaded InputImage
        dispatch(tryOnSlice.actions.setSelectedImage(uploadedImage))
      } catch (error: any) {
        console.error('Image upload error:', error)
        dispatch(tryOnSlice.actions.setIsGenerating(false))
        dispatch(errorSnackbarSlice.actions.showErrorSnackbar())
        trackUploadError('uploadFailed', error.message || 'Upload failed')
        return
      }
    } else if (isInputImage(targetImage)) {
      uploadedImage = targetImage
    } else {
      console.error('Invalid image type')
      dispatch(tryOnSlice.actions.setIsGenerating(false))
      return
    }

    // Store reference to the image actually used for generation
    usedImageRef.current = uploadedImage

    // Step 2: Set scanning stage and create operation
    dispatch(tryOnSlice.actions.setGenerationStage('scanning'))

    const hasSubscriptionId = endpointData.subscriptionId && endpointData.subscriptionId.length > 0
    const operationId = hasSubscriptionId
      ? await createOperationWithJwt(uploadedImage.id)
      : await createOperationWithoutJwt(uploadedImage.id)

    if (!operationId) {
      dispatch(tryOnSlice.actions.setIsGenerating(false))
      dispatch(errorSnackbarSlice.actions.showErrorSnackbar())
      return
    }

    // Save operation ID to Redux
    dispatch(tryOnSlice.actions.setOperationId(operationId))

    // Step 3: After 4 seconds, switch to generating stage
    setTimeout(() => {
      dispatch(tryOnSlice.actions.setGenerationStage('generating'))
    }, 4000)

    // Start status polling
    intervalRef.current = setInterval(() => {
      pollGenerationStatus(operationId)
    }, 3000)
  }, [
    endpointData,
    selectedImage,
    getRecentPhoto,
    trackTryOnInitiated,
    trackUploadError,
    dispatch,
    createOperationWithJwt,
    createOperationWithoutJwt,
    pollGenerationStatus,
  ])

  const regenerate = useCallback(() => {
    dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
    startTryOn()
  }, [dispatch, startTryOn])

  const closeAbortedModal = useCallback(() => {
    dispatch(tryOnSlice.actions.setIsAborted(false))
  }, [dispatch])

  return {
    startTryOn,
    regenerate,
    closeAbortedModal,
  }
}

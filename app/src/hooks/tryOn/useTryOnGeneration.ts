import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector, selectedImageSelector } from '@/store/slices/tryOnSlice'
import { useRpc, useAlert } from '@/contexts'
import {
  TryOnApiService,
  InputImage,
  GenerationResult,
  type AbortReason,
} from '@/utils/api/tryOnApiService'
import { isNewImage, isInputImage, type TryOnImage } from '@/models'
import { resizeAndConvertImage } from '@/utils'
import { useTryOnAnalytics } from './useTryOnAnalytics'
import { useUploadsGallery } from '@/hooks/gallery/useUploadsGallery'
import { useTryOnStrings } from '@/hooks'

export const useTryOnGeneration = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const { showAlert } = useAlert()
  const getState = useAppSelector((state) => state)

  const selectedImage = useAppSelector(selectedImageSelector)

  const {
    trackTryOnInitiated,
    trackTryOnFinished,
    trackTryOnError,
    trackTryOnAborted,
    trackUploadError,
  } = useTryOnAnalytics()

  const { getRecentPhoto } = useUploadsGallery()

  const {
    invalidInputImageDescription,
    invalidInputImageChangePhotoButton,
    noPeopleDetectedDescription,
    tooManyPeopleDetectedDescription,
    childDetectedDescription,
  } = useTryOnStrings()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const usedImageRef = useRef<InputImage | null>(null)

  const getEndpointData = useCallback(() => {
    const apiKey = apiKeySelector(getState)
    const subscriptionId = subscriptionIdSelector(getState)
    const productId = productIdSelector(getState)

    // We need either apiKey OR subscriptionId (not both)
    if (!apiKey && !subscriptionId) {
      return null
    }

    return {
      apiKey,
      subscriptionId,
      skuId: productId,
    }
  }, [getState])

  const clearGenerationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    dispatch(tryOnSlice.actions.setOperationId(null))
  }, [dispatch])

  // ========================================
  // API: Create Operations
  // ========================================
  const createOperationWithJwt = useCallback(
    async (uploadedImageId: string): Promise<string | null> => {
      if (!rpc || !('getJwt' in rpc.config.auth)) return null

      const endpointData = getEndpointData()
      if (!endpointData) return null

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
    [getEndpointData, rpc, trackTryOnError],
  )

  const createOperationWithoutJwt = useCallback(
    async (uploadedImageId: string): Promise<string | null> => {
      const endpointData = getEndpointData()
      if (!endpointData) return null

      try {
        const result = await TryOnApiService.createOperation(uploadedImageId, endpointData)
        return result.operation_id || null
      } catch (error: any) {
        trackTryOnError('requestOperationFailed', error.message)
        return null
      }
    },
    [getEndpointData, trackTryOnError],
  )

  // ========================================
  // Result Handlers
  // ========================================
  const handleGenerationSuccess = useCallback(
    (result: GenerationResult) => {
      if (result.generated_images && result.generated_images.length > 0) {
        const generatedImage = result.generated_images[0]

        dispatch(tryOnSlice.actions.setGeneratedImageUrl(generatedImage.url))

        // Common logic after navigation
        const finalizeGeneration = () => {
          navigate('/results')
          dispatch(tryOnSlice.actions.setIsGenerating(false))

          // After navigation, add images to history and update selectedImage
          dispatch(generationsSlice.actions.addGeneratedImage(generatedImage))

          const imageToStore = usedImageRef.current
          if (imageToStore) {
            // Add to uploads history (imageToStore is always InputImage here)
            dispatch(uploadsSlice.actions.addInputImage(imageToStore))

            // Replace selectedImage (NewImage) with InputImage from server
            // This ensures deletion from history will correctly clear selectedImage
            dispatch(tryOnSlice.actions.setSelectedImage(imageToStore))
          }

          // Clear usedImageRef after use
          usedImageRef.current = null
        }

        // Preload the generated image for instant display on ResultsPage
        const img = new Image()
        img.onload = finalizeGeneration
        img.onerror = finalizeGeneration // Still navigate if preload fails
        img.src = generatedImage.url

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

      // Track with abort_reason if available, fallback to error message
      trackTryOnAborted(result.abort_reason || result.error || 'No people detected in photo')

      // Get message based on abort_reason
      const getAbortMessage = (reason: AbortReason | null | undefined): string => {
        switch (reason) {
          case 'NO_PEOPLE_DETECTED':
            return noPeopleDetectedDescription
          case 'TOO_MANY_PEOPLE_DETECTED':
            return tooManyPeopleDetectedDescription
          case 'CHILD_DETECTED':
            return childDetectedDescription
          default:
            return invalidInputImageDescription
        }
      }

      // Show alert with abort message
      showAlert(getAbortMessage(result.abort_reason), invalidInputImageChangePhotoButton, () => {
        navigate('/')
      })
    },
    [
      dispatch,
      trackTryOnAborted,
      clearGenerationInterval,
      showAlert,
      navigate,
      noPeopleDetectedDescription,
      tooManyPeopleDetectedDescription,
      childDetectedDescription,
      invalidInputImageDescription,
      invalidInputImageChangePhotoButton,
    ],
  )

  // ========================================
  // API: Poll Generation Status
  // ========================================
  const pollGenerationStatus = useCallback(
    async (operationId: string) => {
      const endpointData = getEndpointData()
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
            // Continue waiting for final status
            break
        }
      } catch (error) {
        console.error('Generation polling error:', error)
      }
    },
    [getEndpointData, handleGenerationSuccess, handleGenerationError, handleGenerationAborted],
  )

  // ========================================
  // Public
  // ========================================
  const startTryOn = useCallback(
    async (imageToUse?: TryOnImage): Promise<void> => {
      const endpointData = getEndpointData()
      if (!endpointData) {
        console.error('Endpoints info is missing')
        return
      }

      // Determine image for try-on: use parameter, selectedImage from Redux, or get recent from history
      let targetImage = imageToUse || selectedImage || getRecentPhoto()

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

      const hasSubscriptionId =
        endpointData.subscriptionId && endpointData.subscriptionId.length > 0
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
    },
    [
      getEndpointData,
      selectedImage,
      getRecentPhoto,
      trackTryOnInitiated,
      trackUploadError,
      dispatch,
      createOperationWithJwt,
      createOperationWithoutJwt,
      pollGenerationStatus,
    ],
  )

  const retryTryOn = useCallback(() => {
    dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
    startTryOn()
  }, [dispatch, startTryOn])

  return {
    startTryOn,
    retryTryOn,
  }
}

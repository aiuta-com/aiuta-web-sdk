import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { currentTryOnImageSelector } from '@/store/slices/tryOnSlice'
import { useRpc } from '@/contexts'
import { TryOnApiService, InputImage, GenerationResult } from '@/utils/api/tryOnApiService'
import { useTryOnAnalytics } from './useTryOnAnalytics'
import { useUploadsGallery } from '@/hooks/gallery/useUploadsGallery'

export const useTryOnGeneration = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpc()

  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const uploadedViewFile = useAppSelector(currentTryOnImageSelector)

  // Create combined endpoint data for API calls
  const endpointData = {
    apiKey,
    subscriptionId,
    skuId: productId,
  }

  const { trackTryOnInitiated, trackTryOnFinished, trackTryOnError, trackTryOnAborted } =
    useTryOnAnalytics()

  // Get recent photo function from uploads gallery
  const { getRecentPhoto } = useUploadsGallery()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearGenerationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    dispatch(tryOnSlice.actions.setOperationId(null))
  }, [dispatch])

  const handleGenerationSuccess = useCallback(
    (result: GenerationResult) => {
      if (result.generated_images && result.generated_images.length > 0) {
        const { id, url } = result.generated_images[0]

        dispatch(tryOnSlice.actions.setGeneratedImageUrl(url))
        dispatch(generationsSlice.actions.addGeneratedImage({ id, url }))

        // Add uploaded image to uploads history after successful generation
        if (uploadedViewFile.id) {
          dispatch(
            uploadsSlice.actions.addInputImage({
              id: uploadedViewFile.id,
              url: uploadedViewFile.url,
            }),
          )
        }

        // Preload the generated image for instant display on ResultsPage
        const img = new Image()
        img.onload = () => {
          // Image is preloaded, navigate to results
          navigate('/results')
          dispatch(tryOnSlice.actions.setIsGenerating(false))
        }
        img.onerror = () => {
          // If preload fails, still navigate to results (will load there)
          navigate('/results')
          dispatch(tryOnSlice.actions.setIsGenerating(false))
        }
        img.src = url

        trackTryOnFinished()
        clearGenerationInterval()
      }
    },
    [dispatch, navigate, trackTryOnFinished, clearGenerationInterval, uploadedViewFile],
  )

  const handleGenerationError = useCallback(
    (result: GenerationResult) => {
      clearGenerationInterval()
      dispatch(tryOnSlice.actions.setIsGenerating(false))

      dispatch(
        errorSnackbarSlice.actions.showErrorSnackbar({
          retryButtonText: 'Try again',
          errorMessage: 'Something went wrong. Please try again later.',
        }),
      )

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
            // Clear file in mobile version
            if (uploadedViewFile.id) {
              dispatch(tryOnSlice.actions.clearCurrentImage())
            }
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
    [
      endpointData,
      handleGenerationSuccess,
      handleGenerationError,
      handleGenerationAborted,
      uploadedViewFile.id,
      dispatch,
    ],
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

  const startTryOn = useCallback(
    async (customImage?: InputImage): Promise<void> => {
      if (!endpointData) {
        console.error('Endpoints info is missing')
        return
      }

      // Determine image for try-on
      const targetImage = customImage || (uploadedViewFile.id ? uploadedViewFile : getRecentPhoto())

      if (!targetImage?.id) {
        console.error('No image selected for try-on')
        return
      }

      // Track process start
      trackTryOnInitiated()

      // Update state
      dispatch(errorSnackbarSlice.actions.hideErrorSnackbar())
      dispatch(tryOnSlice.actions.setIsGenerating(true))

      // Create operation
      const hasSubscriptionId =
        endpointData.subscriptionId && endpointData.subscriptionId.length > 0
      const operationId = hasSubscriptionId
        ? await createOperationWithJwt(targetImage.id)
        : await createOperationWithoutJwt(targetImage.id)

      if (!operationId) {
        dispatch(tryOnSlice.actions.setIsGenerating(false))
        dispatch(
          errorSnackbarSlice.actions.showErrorSnackbar({
            retryButtonText: 'Try again',
            errorMessage: 'Something went wrong. Please try again later.',
          }),
        )
        return
      }

      // Save operation ID to Redux
      dispatch(tryOnSlice.actions.setOperationId(operationId))

      // Start status polling
      intervalRef.current = setInterval(() => {
        pollGenerationStatus(operationId)
      }, 3000)
    },
    [
      endpointData,
      uploadedViewFile,
      getRecentPhoto,
      trackTryOnInitiated,
      dispatch,
      createOperationWithJwt,
      createOperationWithoutJwt,
      pollGenerationStatus,
    ],
  )

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

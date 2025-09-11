import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { alertSlice } from '@lib/redux/slices/alertSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { aiutaEndpointDataSelector } from '@lib/redux/slices/configSlice/selectors'
import { uploadedViewFileSelector } from '@lib/redux/slices/fileSlice/selectors'
import { useRpcProxy } from '@/contexts'
import { TryOnApiService, UploadedImage, GenerationResult } from '../../utils/apiService'
import { useTryOnAnalytics } from './useTryOnAnalytics'
import { usePhotoGallery } from './usePhotoGallery'

export const useTryOnGeneration = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const endpointData = useAppSelector(aiutaEndpointDataSelector)
  const uploadedViewFile = useAppSelector(uploadedViewFileSelector)

  const { addPhotoToGallery, getRecentPhoto } = usePhotoGallery()
  const { trackTryOnInitiated, trackTryOnFinished, trackTryOnError, trackTryOnAborted } =
    useTryOnAnalytics()

  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [isOpenAbortedModal, setIsOpenAbortedModal] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const clearGenerationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const handleGenerationSuccess = useCallback(
    (result: GenerationResult) => {
      if (result.generated_images && result.generated_images.length > 0) {
        const { id, url } = result.generated_images[0]

        setGeneratedImageUrl(url)
        dispatch(generateSlice.actions.setGeneratedImage({ id, url }))

        setTimeout(() => {
          dispatch(generateSlice.actions.setIsStartGeneration(false))
          navigate('/generated')
        }, 500)

        trackTryOnFinished()
        clearGenerationInterval()
      }
    },
    [dispatch, navigate, trackTryOnFinished, clearGenerationInterval],
  )

  const handleGenerationError = useCallback(
    (result: GenerationResult) => {
      clearGenerationInterval()
      dispatch(generateSlice.actions.setIsStartGeneration(false))

      dispatch(
        alertSlice.actions.setShowAlert({
          type: 'error',
          isShow: true,
          buttonText: 'Try again',
          content: 'Something went wrong. Please try again',
        }),
      )

      trackTryOnError(result.status, result.error || 'Unknown error')
    },
    [dispatch, trackTryOnError, clearGenerationInterval],
  )

  const handleGenerationAborted = useCallback(
    (result: GenerationResult) => {
      clearGenerationInterval()
      dispatch(generateSlice.actions.setIsStartGeneration(false))
      setIsOpenAbortedModal(true)

      trackTryOnAborted(result.error || 'Unknown reason')
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
              dispatch(fileSlice.actions.setUploadViewFile(null))
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
    async (customImage?: UploadedImage): Promise<void> => {
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
      dispatch(alertSlice.actions.setShowAlert({ isShow: false }))
      dispatch(generateSlice.actions.setIsStartGeneration(true))

      // Add to gallery if this is an uploaded image
      if (uploadedViewFile.id) {
        addPhotoToGallery({ id: uploadedViewFile.id, url: uploadedViewFile.url })
      }

      // Create operation
      const hasUserId = endpointData.userId && endpointData.userId.length > 0
      const operationId = hasUserId
        ? await createOperationWithJwt(targetImage.id)
        : await createOperationWithoutJwt(targetImage.id)

      if (!operationId) {
        dispatch(generateSlice.actions.setIsStartGeneration(false))
        dispatch(
          alertSlice.actions.setShowAlert({
            type: 'error',
            isShow: true,
            buttonText: 'Try again',
            content: 'Something went wrong, please try again later.',
          }),
        )
        return
      }

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
      addPhotoToGallery,
      createOperationWithJwt,
      createOperationWithoutJwt,
      pollGenerationStatus,
    ],
  )

  const regenerate = useCallback(() => {
    dispatch(alertSlice.actions.setShowAlert({ isShow: false }))
    startTryOn()
  }, [dispatch, startTryOn])

  const closeAbortedModal = useCallback(() => {
    setIsOpenAbortedModal(false)
  }, [])

  return {
    generatedImageUrl,
    isOpenAbortedModal,
    startTryOn,
    regenerate,
    closeAbortedModal,
  }
}

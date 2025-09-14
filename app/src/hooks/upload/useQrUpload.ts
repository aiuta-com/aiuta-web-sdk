import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { appSlice } from '@/store/slices/appSlice'
import { qrSlice } from '@/store/slices/qrSlice'
import { qrTokenSelector } from '@/store/slices/qrSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { QrApiService, type QrEndpointData } from '@/utils/api/qrApiService'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'
import { generateRandomString } from '@/utils/helpers/generateRandomString'

export const useQrUpload = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const qrToken = useAppSelector(qrTokenSelector)
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const { trackUploadError } = useTryOnAnalytics()

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Initialize QR token on mount
  useEffect(() => {
    if (!qrToken) {
      dispatch(qrSlice.actions.setToken(generateRandomString()))
    }
  }, [dispatch, qrToken])

  // Upload file from current device
  const uploadFromDevice = useCallback(
    async (file: File) => {
      if (!productId || (!apiKey && !subscriptionId)) return

      const endpointData = { apiKey, subscriptionId, skuId: productId }

      try {
        const result = await QrApiService.uploadImage(file, endpointData as QrEndpointData)

        if (result.owner_type === 'user') {
          const localUrl = URL.createObjectURL(file)
          dispatch(
            tryOnSlice.actions.setCurrentImage({
              id: result.id,
              url: result.url,
              localUrl,
            }),
          )
          dispatch(appSlice.actions.setHasFooter(false))
          navigate('/view')

          // Track success
          // Analytics will be handled by the caller component
        } else if (result.error) {
          handleUploadError(result.error)
        }
      } catch (error: any) {
        handleUploadError(error.message)
      }
    },
    [apiKey, subscriptionId, productId, dispatch, navigate],
  )

  // Check for QR uploaded photo
  const checkQrUpload = useCallback(async () => {
    if (!qrToken || !productId || (!apiKey && !subscriptionId)) return

    try {
      const result = await QrApiService.getQrPhoto(qrToken)

      if (result.owner_type === 'scanning') {
        dispatch(qrSlice.actions.setIsLoading(true))
      } else if (result.owner_type === 'user') {
        dispatch(qrSlice.actions.setIsLoading(false))
        dispatch(
          tryOnSlice.actions.setCurrentImage({
            id: result.id,
            url: result.url,
            localUrl: result.url,
          }),
        )

        // Clean up QR token
        await QrApiService.deleteQrToken(qrToken)

        // Navigate to try-on page
        navigate('/view')

        // Stop polling
        stopPolling()
      }
    } catch (error) {
      console.error('QR polling error:', error)
    }
  }, [qrToken, apiKey, subscriptionId, productId, dispatch, navigate])

  // Start polling for QR uploads
  const startPolling = useCallback(() => {
    if (isPolling || !qrToken) return

    setIsPolling(true)
    qrApiInterval.current = setInterval(checkQrUpload, 3000)
  }, [isPolling, qrToken, checkQrUpload])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (qrApiInterval.current) {
      clearInterval(qrApiInterval.current)
      qrApiInterval.current = null
      setIsPolling(false)
    }
  }, [])

  // Generate QR URL
  const getQrUrl = useCallback(() => {
    if (!qrToken) return ''
    if (!productId) return ''
    // For JWT auth we need subscriptionId, for API key auth we need apiKey
    if (!apiKey && !subscriptionId) return ''

    const endpointData = { apiKey, subscriptionId, skuId: productId }
    return QrApiService.generateQrUrl(qrToken, endpointData as QrEndpointData)
  }, [qrToken, apiKey, subscriptionId, productId])

  // Handle upload errors
  const handleUploadError = useCallback(
    (errorMessage: string) => {
      dispatch(
        errorSnackbarSlice.actions.showErrorSnackbar({
          retryButtonText: 'Try again',
          errorMessage: 'Something went wrong. Please try again later.',
        }),
      )
      trackUploadError(errorMessage, errorMessage)
    },
    [dispatch, trackUploadError],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    qrToken,
    apiKey,
    subscriptionId,
    productId,
    qrUrl: getQrUrl(),
    isPolling,
    uploadFromDevice,
    startPolling,
    stopPolling,
  }
}

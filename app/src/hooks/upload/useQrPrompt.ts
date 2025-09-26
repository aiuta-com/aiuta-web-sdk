import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { qrSlice } from '@/store/slices/qrSlice'
import { qrTokenSelector, qrIsLoadingSelector } from '@/store/slices/qrSlice'
import { apiKeySelector, subscriptionIdSelector } from '@/store/slices/apiSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { QrApiService, type QrEndpointData } from '@/utils/api/qrApiService'
import { generateRandomString } from '@/utils/helpers/generateRandomString'

export const useQrPrompt = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const qrToken = useAppSelector(qrTokenSelector)
  const apiKey = useAppSelector(apiKeySelector)
  const subscriptionId = useAppSelector(subscriptionIdSelector)
  const productId = useAppSelector(productIdSelector)
  const isDownloading = useAppSelector(qrIsLoadingSelector)

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Initialize QR token on mount
  useEffect(() => {
    if (!qrToken) {
      dispatch(qrSlice.actions.setToken(generateRandomString()))
    }
  }, [dispatch, qrToken])

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
        navigate('/tryon')

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
    isDownloading,
    startPolling,
    stopPolling,
  }
}

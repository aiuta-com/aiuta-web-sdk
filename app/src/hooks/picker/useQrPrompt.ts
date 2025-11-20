import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { tryOnSlice } from '@/store/slices/tryOnSlice'
import { qrSlice } from '@/store/slices/qrSlice'
import { qrTokenSelector, qrIsLoadingSelector } from '@/store/slices/qrSlice'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { QrApiService } from '@/utils/api/qrApiService'
import { generateRandomString } from '@/utils/helpers/generateRandomString'
import { useLogger, useRpc } from '@/contexts'

export const useQrPrompt = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const logger = useLogger()
  const rpc = useRpc()

  const qrToken = useAppSelector(qrTokenSelector)
  const productIds = useAppSelector(productIdsSelector)
  const isDownloading = useAppSelector(qrIsLoadingSelector)

  const auth = rpc.config.auth
  const apiKey = 'apiKey' in auth ? auth.apiKey : undefined
  const subscriptionId = 'subscriptionId' in auth ? auth.subscriptionId : undefined

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
    const hasValidAuth =
      (apiKey && apiKey.length > 0) || (subscriptionId && subscriptionId.length > 0)
    if (!qrToken || !productIds.length || !hasValidAuth) return

    try {
      const result = await QrApiService.getQrPhoto(qrToken)

      if (result.owner_type === 'scanning') {
        dispatch(qrSlice.actions.setIsLoading(true))
      } else if (result.owner_type === 'user') {
        dispatch(qrSlice.actions.setIsLoading(false))
        dispatch(
          tryOnSlice.actions.setSelectedImage({
            id: result.id,
            url: result.url,
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
      logger.error('QR polling error:', error)
    }
  }, [qrToken, apiKey, subscriptionId, productIds, dispatch, navigate])

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
  const qrUrl = useMemo(() => {
    if (!qrToken) return ''

    // For JWT auth we need subscriptionId, for API key auth we need apiKey
    // Check for non-empty strings, not just truthy values
    const hasApiKey = apiKey && apiKey.length > 0
    const hasSubscriptionId = subscriptionId && subscriptionId.length > 0

    if (!hasApiKey && !hasSubscriptionId) return ''

    const params = hasSubscriptionId ? `sid=${subscriptionId}` : `key=${apiKey}`

    // Get current app URL instead of hardcoded static URL
    const currentUrl = new URL(window.location.href)
    const baseUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}`

    return `${baseUrl}#/qr/${qrToken}?${params}`
  }, [qrToken, apiKey, subscriptionId])

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
    productIds,
    qrUrl,
    isPolling,
    isDownloading,
    startPolling,
    stopPolling,
  }
}

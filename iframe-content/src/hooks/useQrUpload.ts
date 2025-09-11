import { useRef, useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@lib/redux/store'
import { fileSlice } from '@lib/redux/slices/fileSlice'
import { alertSlice } from '@lib/redux/slices/alertSlice'
import { configSlice } from '@lib/redux/slices/configSlice'
import { qrTokenSelector, aiutaEndpointDataSelector } from '@lib/redux/slices/configSlice/selectors'
import { QrApiService, type QrEndpointData } from '../utils/qrApiService'
import { useTryOnAnalytics } from './useTryOnAnalytics'
import { generateRandomString } from '../helpers/generateRandomString'

export const useQrUpload = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const qrToken = useAppSelector(qrTokenSelector)
  const endpointData = useAppSelector(aiutaEndpointDataSelector)
  const { trackUploadError } = useTryOnAnalytics()

  const qrApiInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // Initialize QR token on mount
  useEffect(() => {
    if (!qrToken) {
      dispatch(configSlice.actions.setQrToken(generateRandomString()))
    }
  }, [dispatch, qrToken])

  // Upload file from current device
  const uploadFromDevice = useCallback(
    async (file: File) => {
      if (!endpointData) return

      try {
        const result = await QrApiService.uploadImage(file, endpointData as QrEndpointData)

        if (result.owner_type === 'user') {
          dispatch(fileSlice.actions.setUploadViewFile({ file, ...result }))
          dispatch(configSlice.actions.setIsShowFooter(false))
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
    [endpointData, dispatch, navigate],
  )

  // Check for QR uploaded photo
  const checkQrUpload = useCallback(async () => {
    if (!qrToken || !endpointData) return

    try {
      const result = await QrApiService.getQrPhoto(qrToken)

      if (result.owner_type === 'scanning') {
        dispatch(configSlice.actions.setIsShowQrSpinner(true))
      } else if (result.owner_type === 'user') {
        dispatch(configSlice.actions.setIsShowQrSpinner(false))
        dispatch(fileSlice.actions.setUploadViewFile({ ...result }))

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
  }, [qrToken, endpointData, dispatch, navigate])

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
    if (!qrToken || !endpointData) return ''
    return QrApiService.generateQrUrl(qrToken, endpointData as QrEndpointData)
  }, [qrToken, endpointData])

  // Handle upload errors
  const handleUploadError = useCallback(
    (errorMessage: string) => {
      dispatch(
        alertSlice.actions.setShowAlert({
          type: 'error',
          isShow: true,
          buttonText: 'Try again',
          content: 'Something went wrong, please try again later.',
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
    endpointData,
    qrUrl: getQrUrl(),
    isPolling,
    uploadFromDevice,
    startPolling,
    stopPolling,
  }
}

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { QrApiService, type QrEndpointData } from '@/utils/api/qrApiService'
import { useTryOnAnalytics } from '@/hooks/tryOn/useTryOnAnalytics'

interface UseQrUploadProps {
  token?: string
  apiKey: string
  subscriptionId?: string
}

interface UploadState {
  isUploading: boolean
  uploadedUrl: string | null
  selectedFile: { file: File; url: string } | null
}

export const useQrUpload = ({ token, apiKey, subscriptionId }: UseQrUploadProps) => {
  const dispatch = useAppDispatch()
  const { trackUploadError } = useTryOnAnalytics()

  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadedUrl: null,
    selectedFile: null,
  })

  const cleanupUrlRef = useRef<string | null>(null)

  // Set QR status to scanning on mount
  useEffect(() => {
    if (token) {
      QrApiService.setQrScanning(token)
    }
  }, [token])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (cleanupUrlRef.current) {
        URL.revokeObjectURL(cleanupUrlRef.current)
      }
    }
  }, [])

  // Select file for upload
  const selectFile = useCallback((file: File) => {
    // Cleanup previous URL
    if (cleanupUrlRef.current) {
      URL.revokeObjectURL(cleanupUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    cleanupUrlRef.current = objectUrl

    setUploadState((prev) => ({
      ...prev,
      selectedFile: { file, url: objectUrl },
      uploadedUrl: null,
    }))
  }, [])

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

  // Upload selected file
  const uploadFile = useCallback(async () => {
    if (!uploadState.selectedFile || !token) return

    try {
      setUploadState((prev) => ({ ...prev, isUploading: true }))

      const endpointData: QrEndpointData = {
        apiKey,
        subscriptionId,
        skuId: '', // QR uploads don't need skuId
      }

      const result = await QrApiService.uploadImage(uploadState.selectedFile.file, endpointData)
      await QrApiService.uploadQrPhoto(token, result)

      // Simulate processing time for better UX
      setTimeout(() => {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          uploadedUrl: result.url,
        }))
      }, 3000)
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadState((prev) => ({ ...prev, isUploading: false }))
      handleUploadError(error.message || 'Upload failed')
    }
  }, [uploadState.selectedFile, token, apiKey, subscriptionId, handleUploadError])

  // Reset state
  const reset = useCallback(() => {
    if (cleanupUrlRef.current) {
      URL.revokeObjectURL(cleanupUrlRef.current)
      cleanupUrlRef.current = null
    }

    setUploadState({
      isUploading: false,
      uploadedUrl: null,
      selectedFile: null,
    })
  }, [])

  return {
    uploadState,
    selectFile,
    uploadFile,
    reset,
  }
}

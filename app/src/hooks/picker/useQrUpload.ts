import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAppDispatch } from '@/store/store'
import { errorSnackbarSlice } from '@/store/slices/errorSnackbarSlice'
import { QrApiService, type QrEndpointData } from '@/utils/api/qrApiService'
import { TryOnApiService } from '@/utils/api/tryOnApiService'
import { resizeAndConvertImage } from '@/utils'
import { useLogger } from '@/contexts'

interface UploadState {
  isUploading: boolean
  uploadedUrl: string | null
  selectedFile: { file: File; url: string } | null
}

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

export const useQrUpload = () => {
  const dispatch = useAppDispatch()
  const logger = useLogger()
  const { token } = useParams<{ token: string }>()
  const query = useQuery()
  const apiKey = query.get('key') || ''
  const subscriptionId = query.get('sid') || ''

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
      dispatch(errorSnackbarSlice.actions.showErrorSnackbar())
      logger.warn('QR Upload error:', errorMessage)
    },
    [dispatch],
  )

  // Upload selected file
  const uploadFile = useCallback(async () => {
    if (!uploadState.selectedFile || !token) return

    try {
      setUploadState((prev) => ({ ...prev, isUploading: true }))

      const endpointData: QrEndpointData = {
        apiKey,
        subscriptionId: subscriptionId || undefined,
        skuId: '', // QR uploads don't need skuId
      }

      // Process image (resize, convert, fix EXIF orientation)
      const processedFile = await resizeAndConvertImage(uploadState.selectedFile.file)
      const uploadResult = await TryOnApiService.uploadImage(processedFile, endpointData)

      // Convert to QrUploadResult format
      const qrResult = {
        id: uploadResult.id,
        url: uploadResult.url,
        owner_type: (uploadResult.owner_type as 'user' | 'scanning') || 'user',
        error: uploadResult.error,
      }

      await QrApiService.uploadQrPhoto(token, qrResult)

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        uploadedUrl: qrResult.url,
      }))
    } catch (error: any) {
      logger.error('Upload error:', error)
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

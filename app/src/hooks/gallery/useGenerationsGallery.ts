import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { selectedImagesSelector } from '@/store/slices/generationsSlice/selectors'
import { isMobileSelector } from '@/store/slices/appSlice'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { useRpc } from '@/contexts'
import { useImageGallery } from './useImageGallery'
import { useImageSelection } from './useImageSelection'
import { useGenerationsData, useRemoveGeneration, useAddGeneration } from '@/hooks/data'
import { ImageItem } from './useFullScreenViewer'

interface UseGenerationsGalleryProps {
  onCloseModal?: () => void
  onShowDeleteModal?: () => void
}

/**
 * Hook for managing generated images gallery functionality
 */
export const useGenerationsGallery = ({
  onCloseModal,
  onShowDeleteModal,
}: UseGenerationsGalleryProps = {}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const rpc = useRpc()
  const isMobile = useAppSelector(isMobileSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const { data: generatedImages = [] } = useGenerationsData()
  const { mutate: removeGeneration } = useRemoveGeneration()
  const { mutate: addGeneration } = useAddGeneration()
  const productIds = useAppSelector(productIdsSelector)
  const isSelecting = useAppSelector(generationsIsSelectingSelector)

  // Convert React Query data to ImageItem format
  const images: ImageItem[] = generatedImages.map(({ id, url }) => ({ id, url }))

  const { selectedIds, clearSelection, hasSelection } = useImageSelection()

  const gallery = useImageGallery({
    images,
    galleryType: 'generations',
    modalType: 'generations',
    onImageSelect: handleImageSelect,
    enableSelection: isSelecting,
  })

  const { trackImageDeleted, trackEvent } = gallery

  // Toggle image selection for deletion
  function toggleImageSelection(imageId: string) {
    const newSelectedIds = gallery.isSelected(imageId)
      ? selectedIds.filter((id) => id !== imageId)
      : [...selectedIds, imageId]

    dispatch(generationsSlice.actions.setSelectedImages(newSelectedIds))
  }

  // Handle image selection (for selection or full screen view)
  function handleImageSelect(image: ImageItem) {
    if (isSelecting) {
      toggleImageSelection(image.id)
    } else {
      // Show full screen (different logic for desktop vs mobile)
      if (!isMobile) {
        gallery.showFullScreen(image)
      } else {
        dispatch(uploadsSlice.actions.showImageFullScreen(image.url))
      }
    }
  }

  // Close history images removal modal
  const closeHistoryImagesModal = useCallback(() => {
    onCloseModal?.()
  }, [onCloseModal])

  // Delete selected images
  const deleteSelectedImages = useCallback(() => {
    // Delete each selected image
    selectedImages.forEach((imageId) => {
      removeGeneration(imageId)
      trackImageDeleted(imageId)
    })

    // Update Redux UI state
    clearSelection() // Clear selection first
    dispatch(generationsSlice.actions.setIsSelecting(false)) // Exit selection mode
    closeHistoryImagesModal()
  }, [
    selectedImages,
    removeGeneration,
    clearSelection,
    dispatch,
    closeHistoryImagesModal,
    trackImageDeleted,
  ])

  // Toggle select all action
  const toggleSelectAll = useCallback(() => {
    const allImageIds = generatedImages.map(({ id }) => id)
    const allSelected =
      allImageIds.length > 0 && allImageIds.every((id) => selectedImages.includes(id))

    if (allSelected) {
      // If all selected - clear selection
      dispatch(generationsSlice.actions.clearSelectedImages())
    } else {
      // Otherwise - select all
      dispatch(generationsSlice.actions.setSelectedImages(allImageIds))
    }
  }, [dispatch, generatedImages, selectedImages])

  // Handle cancel selection
  const handleCancel = useCallback(() => {
    dispatch(generationsSlice.actions.clearSelectedImages())
    dispatch(generationsSlice.actions.setIsSelecting(false))
  }, [dispatch])

  // Handle download selected images
  const handleDownloadSelectedImages = useCallback(async () => {
    for (const image of generatedImages) {
      if (selectedImages.includes(image.id)) {
        const response = await fetch(image.url, { mode: 'cors' })
        const blob = await response.blob()

        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = blobUrl
        link.download = `try-on-${Date.now()}`
        document.body.appendChild(link)

        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }
    }

    const analytic = {
      type: 'share',
      event: 'downloaded',
      pageId: 'history',
      productIds,
    }

    rpc.sdk.trackEvent(analytic)
  }, [generatedImages, selectedImages, productIds, rpc.sdk])

  // Selection actions for SelectionSnackbar
  const handleDelete = onShowDeleteModal || (() => {})
  const handleDownload = handleDownloadSelectedImages

  // Navigate to home when all images are deleted
  useEffect(() => {
    if (generatedImages.length === 0) {
      navigate('/')
    }
  }, [generatedImages.length, navigate])

  // Handle message events from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'REMOVE_HISTORY_IMAGES') {
        addGeneration(event.data.data.images)

        // Track deletion analytics
        trackEvent('generatedImageDeleted')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [addGeneration, trackEvent])

  return {
    ...gallery,
    images,
    generatedImages,
    selectedImages,
    hasSelection,
    isSelecting,
    deleteSelectedImages,
    closeHistoryImagesModal,
    // Selection snackbar props
    selectedCount: selectedImages.length,
    totalCount: generatedImages.length,
    onCancel: handleCancel,
    onSelectAll: toggleSelectAll,
    onDelete: handleDelete,
    onDownload: handleDownload,
  }
}

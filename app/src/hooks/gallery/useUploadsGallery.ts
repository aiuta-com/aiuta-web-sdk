import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import {
  selectedUploadsSelector,
  uploadsIsSelectingSelector,
  inputImagesSelector,
} from '@/store/slices/uploadsSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { useImageGallery } from './useImageGallery'
import { useImageUpload } from '@/hooks/upload/useImageUpload'
import { ImageItem } from './useFullScreenViewer'
import type { SelectionActionItem } from '@/components/ui/snackbars/SelectionSnackbar'

interface UseUploadsGalleryProps {
  onCloseModal?: () => void
  onShowDeleteModal?: () => void
}

/**
 * Hook for managing uploaded photos gallery functionality
 */
export const useUploadsGallery = ({
  onCloseModal,
  onShowDeleteModal,
}: UseUploadsGalleryProps = {}) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const selectedImages = useAppSelector(selectedUploadsSelector)
  const recentlyPhotos = useAppSelector(inputImagesSelector)
  const isSelectPreviouslyImages = useAppSelector(uploadsIsSelectingSelector)
  const { uploadImage } = useImageUpload()

  // Convert Redux photos to ImageItem format
  const images: ImageItem[] = recentlyPhotos.map(({ id, url }) => ({ id, url }))

  // Selection state computed from Redux
  const hasSelection = selectedImages.length > 0

  // Clear selection helper
  const clearSelection = useCallback(() => {
    dispatch(uploadsSlice.actions.clearSelectedImages())
  }, [dispatch])

  const gallery = useImageGallery({
    images,
    galleryType: 'uploads',
    modalType: 'previously',
    onImageSelect: handleImageSelect,
    onImageDelete: handleImageDelete,
    enableSelection: false, // Handle selection logic in handleImageSelect
  })

  // Handle image selection (for full screen view only - selection is handled by SelectableImage)
  function handleImageSelect(image: ImageItem) {
    if (!isSelectPreviouslyImages) {
      // Not in selection mode - show full screen
      if (isMobile) {
        // Mobile: set full screen URL in Redux
        dispatch(uploadsSlice.actions.showImageFullScreen(image.url))
      } else {
        // Desktop: show full screen modal
        gallery.showFullScreen(image)
      }
    }
    // In selection mode, SelectableImage handles the click
  }

  // Handle image deletion
  function handleImageDelete(imageId: string) {
    const updatedPhotos = recentlyPhotos.filter(({ id }) => id !== imageId)
    dispatch(uploadsSlice.actions.setInputImages(updatedPhotos))
  }

  // Close uploads images removal modal
  const closeUploadsImagesModal = useCallback(() => {
    onCloseModal?.()
  }, [onCloseModal])

  // Delete selected images
  const deleteSelectedImages = useCallback(() => {
    const remainingImages = recentlyPhotos.filter(({ id }) => !selectedImages.includes(id))

    // Update Redux state
    clearSelection() // Clear selection first
    dispatch(uploadsSlice.actions.setInputImages(remainingImages))
    closeUploadsImagesModal()

    // Track deletion if needed (similar to generations)
    // selectedImages.forEach((imageId) => {
    //   trackImageDeleted(imageId)
    // })
  }, [recentlyPhotos, selectedImages, clearSelection, dispatch, closeUploadsImagesModal])

  // Handle select all action
  const handleSelectAll = useCallback(() => {
    const uploadsImagesId = recentlyPhotos.map(({ id }) => id)
    dispatch(uploadsSlice.actions.setSelectedImages(uploadsImagesId))
  }, [dispatch, recentlyPhotos])

  // Handle cancel selection
  const handleCancel = useCallback(() => {
    dispatch(uploadsSlice.actions.clearSelectedImages())
  }, [dispatch])

  // Selection actions for SelectionSnackbar (only delete, no download for uploads)
  const selectionActions: SelectionActionItem[] = [
    {
      iconUrl: './icons/trash.svg',
      label: 'Delete selected images',
      onClick: onShowDeleteModal || (() => {}),
    },
  ]

  // Handle new photo upload
  const handlePhotoUpload = useCallback(
    async (file: File) => {
      await uploadImage(file, () => {
        // Navigate to try-on page after successful upload
        navigate('/view')
      })
    },
    [uploadImage, navigate],
  )

  // Navigate to upload page
  const navigateToUpload = useCallback(() => {
    // Always go to QR page when user explicitly wants to upload
    navigate('/qr')
  }, [navigate])

  return {
    ...gallery,
    images,
    recentlyPhotos,
    selectedImages,
    hasSelection,
    isSelectPreviouslyImages,
    isMobile,
    deleteSelectedImages,
    closeUploadsImagesModal,
    handlePhotoUpload,
    navigateToUpload,
    // Selection snackbar props
    selectedCount: selectedImages.length,
    totalCount: recentlyPhotos.length,
    onCancel: handleCancel,
    onSelectAll: handleSelectAll,
    selectionActions,
  }
}

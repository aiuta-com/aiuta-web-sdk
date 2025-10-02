import { useCallback } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { useFullScreenViewer, ImageItem } from './useFullScreenViewer'
import { useImageSelection } from './useImageSelection'
import { useGalleryAnalytics } from './useGalleryAnalytics'

interface UseImageGalleryOptions {
  images: ImageItem[]
  galleryType: 'uploads' | 'generations'
  modalType: 'uploads' | 'generations'
  onImageSelect?: (image: ImageItem) => void
  onImageDelete?: (imageId: string) => void
  enableSelection?: boolean
}

/**
 * Universal hook for managing image galleries
 */
export const useImageGallery = ({
  images,
  galleryType,
  modalType,
  onImageSelect,
  onImageDelete,
  enableSelection = false,
}: UseImageGalleryOptions) => {
  const isMobile = useAppSelector(isMobileSelector)
  const { showFullScreen } = useFullScreenViewer({ modalType, images })
  const { selectedIds, toggleSelection, clearSelection, isSelected, hasSelection } =
    useImageSelection()
  const { trackImageSelected, trackImageDeleted, trackEvent } = useGalleryAnalytics(galleryType)

  const handleImageClick = useCallback(
    (image: ImageItem) => {
      if (enableSelection) {
        toggleSelection(image.id)
      } else if (onImageSelect) {
        onImageSelect(image)
        // Only track selection for uploads gallery, not for generations gallery
        if (galleryType === 'uploads') {
          trackImageSelected(image.id)
        }
      } else if (isMobile) {
        // Mobile: show full screen modal for mobile when no select handler
        showFullScreen(image)
      } else {
        // Desktop: show full screen modal
        showFullScreen(image)
      }
    },
    [
      enableSelection,
      toggleSelection,
      onImageSelect,
      isMobile,
      showFullScreen,
      trackImageSelected,
      galleryType,
    ],
  )

  const handleImageDelete = useCallback(
    (imageId: string) => {
      onImageDelete?.(imageId)
      trackImageDeleted(imageId)
    },
    [onImageDelete, trackImageDeleted],
  )

  return {
    // Gallery state
    images,
    isEmpty: images.length === 0,
    isMobile,

    // Selection state
    selectedIds,
    hasSelection,
    isSelected,
    clearSelection,

    // Event handlers
    handleImageClick,
    handleImageDelete,

    // Utilities
    showFullScreen,

    // Analytics
    trackImageSelected,
    trackImageDeleted,
    trackEvent,
  }
}

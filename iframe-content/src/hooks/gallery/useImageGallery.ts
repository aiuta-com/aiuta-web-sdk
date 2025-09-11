import { useCallback, useEffect } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/configSlice/selectors'
import { useFullScreenViewer, ImageItem } from './useFullScreenViewer'
import { useImageSelection } from './useImageSelection'
import { useGalleryAnalytics } from './useGalleryAnalytics'

interface UseImageGalleryOptions {
  images: ImageItem[]
  galleryType: 'history' | 'previously' | 'uploads' | 'generations'
  modalType: 'history' | 'previously'
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
  const { trackPageView, trackImageSelected, trackImageDeleted, trackEvent } =
    useGalleryAnalytics(galleryType)

  // Track page view on mount
  useEffect(() => {
    trackPageView()
  }, [trackPageView])

  const handleImageClick = useCallback(
    (image: ImageItem) => {
      if (enableSelection) {
        toggleSelection(image.id)
        trackImageSelected(image.id)
      } else if (onImageSelect) {
        onImageSelect(image)
        trackImageSelected(image.id)
      } else if (isMobile) {
        // Mobile: show full screen modal for mobile when no select handler
        showFullScreen(image)
      } else {
        // Desktop: show full screen modal
        showFullScreen(image)
      }
    },
    [enableSelection, toggleSelection, onImageSelect, isMobile, showFullScreen, trackImageSelected],
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

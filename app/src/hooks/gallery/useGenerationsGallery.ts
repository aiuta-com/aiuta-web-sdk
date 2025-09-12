import { useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from '@/store/slices/generationsSlice/selectors'
import {
  isMobileSelector,
  isSelectHistoryImagesSelector,
} from '@/store/slices/configSlice/selectors'
import { useImageGallery } from './useImageGallery'
import { useImageSelection } from './useImageSelection'
import { ImageItem } from './useFullScreenViewer'

interface UseGenerationsGalleryProps {
  onCloseModal?: () => void
}

/**
 * Hook for managing generated images gallery functionality
 */
export const useGenerationsGallery = ({ onCloseModal }: UseGenerationsGalleryProps = {}) => {
  const dispatch = useAppDispatch()
  const isMobile = useAppSelector(isMobileSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const isSelectHistoryImages = useAppSelector(isSelectHistoryImagesSelector)

  // Convert Redux images to ImageItem format
  const images: ImageItem[] = generatedImages.map(({ id, url }) => ({ id, url }))

  const { selectedIds, clearSelection, hasSelection } = useImageSelection()

  const gallery = useImageGallery({
    images,
    galleryType: 'generations',
    modalType: 'history',
    onImageSelect: handleImageSelect,
    enableSelection: isSelectHistoryImages,
  })

  const { trackImageDeleted, trackEvent } = gallery

  // Handle image selection (for selection or full screen view)
  function handleImageSelect(image: ImageItem) {
    if (!isMobile) {
      if (isSelectHistoryImages) {
        // Desktop: toggle selection for deletion
        if (gallery.isSelected(image.id)) {
          dispatch(
            generationsSlice.actions.setSelectedImages(selectedIds.filter((id) => id !== image.id)),
          )
        } else {
          dispatch(generationsSlice.actions.setSelectedImages([...selectedIds, image.id]))
        }
      } else {
        // Desktop: show full screen modal
        gallery.showFullScreen(image)
      }
    } else {
      if (isSelectHistoryImages) {
        // Mobile: toggle selection for deletion
        if (gallery.isSelected(image.id)) {
          dispatch(
            generationsSlice.actions.setSelectedImages(selectedIds.filter((id) => id !== image.id)),
          )
        } else {
          dispatch(generationsSlice.actions.setSelectedImages([...selectedIds, image.id]))
        }
      } else {
        // Mobile: set full screen URL in Redux
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
    const remainingImages = generatedImages.filter(({ id }) => !selectedImages.includes(id))

    // Update Redux state
    clearSelection() // Clear selection first
    dispatch(generationsSlice.actions.setGeneratedImages(remainingImages))
    closeHistoryImagesModal()

    // Track deletion
    selectedImages.forEach((imageId) => {
      trackImageDeleted(imageId)
    })
  }, [
    generatedImages,
    selectedImages,
    clearSelection,
    dispatch,
    closeHistoryImagesModal,
    trackImageDeleted,
  ])

  // Handle message events from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'REMOVE_HISTORY_IMAGES') {
        dispatch(generationsSlice.actions.addGeneratedImage(event.data.data.images))

        // Track deletion analytics
        trackEvent('generatedImageDeleted')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [dispatch, trackEvent])

  return {
    ...gallery,
    images,
    generatedImages,
    selectedImages,
    hasSelection,
    isSelectHistoryImages,
    isMobile,
    deleteSelectedImages,
    closeHistoryImagesModal,
  }
}

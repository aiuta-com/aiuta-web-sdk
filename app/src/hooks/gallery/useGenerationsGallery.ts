import { useCallback, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from '@/store/slices/generationsSlice/selectors'
import { isMobileSelector } from '@/store/slices/appSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { generationsIsSelectingSelector } from '@/store/slices/generationsSlice'
import { useRpcProxy } from '@/contexts'
import { useImageGallery } from './useImageGallery'
import { useImageSelection } from './useImageSelection'
import { ImageItem } from './useFullScreenViewer'
import type { SelectionActionItem } from '@/components/SelectionSnackbar'

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
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()
  const isMobile = useAppSelector(isMobileSelector)
  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const productId = useAppSelector(productIdSelector)
  const isSelectHistoryImages = useAppSelector(generationsIsSelectingSelector)

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

  // Handle select all action
  const handleSelectAll = useCallback(() => {
    const generatedImagesId = generatedImages.map(({ id }) => id)
    dispatch(generationsSlice.actions.setSelectedImages(generatedImagesId))
  }, [dispatch, generatedImages])

  // Handle cancel selection
  const handleCancel = useCallback(() => {
    dispatch(generationsSlice.actions.clearSelectedImages())
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
      data: {
        type: 'share',
        event: 'downloaded',
        pageId: 'history',
        productIds: [productId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }, [generatedImages, selectedImages, productId, rpc.sdk])

  // Selection actions for SelectionSnackbar
  const selectionActions: SelectionActionItem[] = [
    {
      iconUrl: './icons/trash.svg',
      label: 'Delete selected images',
      onClick: onShowDeleteModal || (() => {}),
    },
    {
      iconUrl: './icons/download.svg',
      label: 'Download selected images',
      onClick: handleDownloadSelectedImages,
    },
  ]

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
    // Selection snackbar props
    selectedCount: selectedImages.length,
    totalCount: generatedImages.length,
    onCancel: handleCancel,
    onSelectAll: handleSelectAll,
    selectionActions,
  }
}

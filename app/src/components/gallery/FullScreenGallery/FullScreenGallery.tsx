import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice, fullScreenImageUrlSelector } from '@/store/slices/uploadsSlice'
import { galleryModalSlice, galleryModalSelector } from '@/store/slices/galleryModalSlice'
import { ThumbnailList, IconButton, Confirmation } from '@/components'
import { useShare, useLogger } from '@/contexts'
import { useSelectionStrings } from '@/hooks'
import { useGenerationsData, useDeleteGeneratedImages } from '@/hooks/data'
import { combineClassNames } from '@/utils'
import { ActionButtonsPanel } from './components/ActionButtonsPanel'
import { ZoomableImage, type ImageBox } from './components/ZoomableImage'
import { icons } from './icons'
import styles from './FullScreenGallery.module.scss'

// Gap between the image's right edge and the action buttons column
const ACTIONS_GAP = 12

export const FullScreenGallery = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const logger = useLogger()
  const { openShareModal } = useShare()
  const { deleteConfirmationTitle, deleteConfirmationKeep, deleteConfirmationDelete } =
    useSelectionStrings()
  // Displayed image rect, so the action buttons can hug its right edge
  const [imageBox, setImageBox] = useState<ImageBox | null>(null)
  const handleImageBox = useCallback((box: ImageBox | null) => setImageBox(box), [])
  // Delete confirmation dialog visibility
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Mobile: single-image fullscreen (pinch-to-zoom, tap to close)
  const fullScreenImageUrl = useAppSelector(fullScreenImageUrlSelector)
  // Desktop: gallery modal (thumbnails + zoomable image + actions)
  const { isOpen, images, activeId, modalType } = useAppSelector(galleryModalSelector)

  const { data: generations = [] } = useGenerationsData()
  const { mutate: deleteGenerations } = useDeleteGeneratedImages()

  const closeMobile = useCallback(() => {
    dispatch(uploadsSlice.actions.showImageFullScreen(null))
  }, [dispatch])

  const closeGallery = useCallback(() => {
    setConfirmDelete(false)
    dispatch(galleryModalSlice.actions.closeGalleryModal())
  }, [dispatch])

  const downloadImage = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url, { mode: 'cors' })
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `try-on-${Date.now()}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } catch (error) {
        logger.error('Failed to download image:', error)
      }
    },
    [logger],
  )

  // ===== Mobile single-image fullscreen =====
  if (fullScreenImageUrl && !isOpen) {
    return (
      <div className={styles.fullScreenModal} data-testid="aiuta-fullscreen-gallery">
        <IconButton
          icon='<path d="M18.9495 5.05C19.3401 5.44052 19.3401 6.07369 18.9495 6.46421L13.4142 11.9995L18.9502 17.5355C19.3404 17.926 19.3404 18.5593 18.9502 18.9498C18.5598 19.3402 17.9266 19.34 17.536 18.9498L12 13.4137L6.46399 18.9498C6.07344 19.34 5.44021 19.3402 5.04978 18.9498C4.65955 18.5593 4.65958 17.926 5.04978 17.5355L10.5858 11.9995L5.05047 6.46421C4.65994 6.07369 4.65994 5.44052 5.05047 5.05C5.44101 4.65969 6.07423 4.65955 6.46468 5.05L12 10.5853L17.5353 5.05C17.9258 4.65954 18.559 4.65969 18.9495 5.05Z" fill="currentColor"/>'
          label="Close fullscreen image"
          onClick={(e) => {
            e?.stopPropagation()
            closeMobile()
          }}
          className={styles.closeButton}
          size={20}
        />
        <ZoomableImage src={fullScreenImageUrl} alt="Full Screen Image" onClose={closeMobile} />
      </div>
    )
  }

  // ===== Desktop gallery modal =====
  if (isOpen && images.length > 0) {
    const activeImage = images.find((image) => image.id === activeId) ?? images[0]
    const showDelete = modalType === 'generations'
    // ThumbnailList renders only with more than one image
    const hasThumbnails = images.length > 1

    const performDelete = () => {
      setConfirmDelete(false)
      const idx = images.findIndex((image) => image.id === activeImage.id)
      const target = generations.find((image) => image.id === activeImage.id)
      if (target) deleteGenerations([target])

      const remaining = images.filter((image) => image.id !== activeImage.id)
      if (remaining.length === 0) {
        // Deleted the last image → close the viewer, and the (now empty)
        // history page behind it
        closeGallery()
        if (modalType === 'generations') navigate('/')
        return
      }
      // Advance to the next image (or the previous one if we removed the last)
      const nextId = remaining[Math.min(idx, remaining.length - 1)].id
      dispatch(galleryModalSlice.actions.setGalleryImages(remaining))
      dispatch(galleryModalSlice.actions.setActiveGalleryImage(nextId))
    }

    return (
      <div
        className={styles.advancedFullScreenModal}
        data-testid="fullscreen-gallery"
        // Clicking the dark backdrop (not the image or controls) closes
        onClick={(e) => {
          if (e.target === e.currentTarget) closeGallery()
        }}
      >
        {/* Left sidebar with image thumbnails */}
        <ThumbnailList
          items={images}
          activeId={activeImage.id}
          onItemClick={(item) => dispatch(galleryModalSlice.actions.setActiveGalleryImage(item.id))}
          variant="fullscreen"
          direction="vertical"
          className={styles.leftContent}
        />

        {/* Center content with image and action buttons */}
        <div
          className={combineClassNames(
            styles.centerContent,
            !hasThumbnails && styles.centerContent_noThumbnails,
          )}
        >
          <div className={styles.zoomArea}>
            <ZoomableImage
              key={activeImage.url}
              src={activeImage.url}
              alt="Full Screen Image"
              tapToClose={false}
              onClose={closeGallery}
              onImageBox={handleImageBox}
            />
          </div>
          <ActionButtonsPanel
            onShare={() => openShareModal(activeImage.url)}
            onDownload={() => downloadImage(activeImage.url)}
            onDelete={() => setConfirmDelete(true)}
            showDelete={showDelete}
            // Hug the image's visible right edge (clamped to the image area, so
            // the column stops at the reserved strip instead of sliding under a
            // zoomed image). Vertical is anchored to the fitted image's bottom.
            style={
              imageBox
                ? {
                    left: Math.min(imageBox.right, imageBox.containerW) + ACTIONS_GAP,
                    top: imageBox.fitBottom,
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translateY(-100%)',
                  }
                : undefined
            }
          />
        </div>

        {/* Close button (top-right) */}
        <IconButton
          icon={icons.close}
          label="Close"
          size={24}
          viewBox="0 0 24 24"
          className={styles.closeButton}
          onClick={closeGallery}
        />

        {/* Delete confirmation (same dialog as the gallery) */}
        <Confirmation
          isVisible={confirmDelete}
          message={deleteConfirmationTitle}
          leftButtonText={deleteConfirmationKeep}
          rightButtonText={deleteConfirmationDelete}
          onLeftClick={() => setConfirmDelete(false)}
          onRightClick={performDelete}
        />
      </div>
    )
  }

  // Nothing to show
  return null
}

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice, fullScreenImageUrlSelector } from '@/store/slices/uploadsSlice'
import { galleryModalSlice, galleryModalSelector } from '@/store/slices/galleryModalSlice'
import { isMobileSelector } from '@/store/slices/appSlice'
import { ThumbnailList, IconButton, Confirmation } from '@/components'
import type { ThumbnailWheelApi } from '@/components/gallery/ThumbnailList/types'
import { useShare, useLogger } from '@/contexts'
import { useSelectionStrings, usePreventParentScroll } from '@/hooks'
import { useGenerationsData, useDeleteGeneratedImages } from '@/hooks/data'
import { combineClassNames } from '@/utils'
import { ActionButtonsPanel } from './components/ActionButtonsPanel'
import { ZoomableImage, type ImageBox } from './components/ZoomableImage'
import { icons } from './icons'
import styles from './FullScreenGallery.module.scss'

export const FullScreenGallery = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const logger = useLogger()
  const { openShareModal } = useShare()
  const { deleteConfirmationTitle, deleteConfirmationKeep, deleteConfirmationDelete } =
    useSelectionStrings()
  // The previous image, held behind the new one while it loads so switching
  // images doesn't flash an empty frame
  const [prevUrl, setPrevUrl] = useState<string | null>(null)
  // ZoomableImage reports its measured box once the new image is ready → drop
  // the held previous one.
  const handleImageBox = useCallback((box: ImageBox | null) => {
    if (box) setPrevUrl(null)
  }, [])
  // Delete confirmation dialog visibility
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Mobile: single-image fullscreen (pinch-to-zoom, tap to close)
  const fullScreenImageUrl = useAppSelector(fullScreenImageUrlSelector)
  // Desktop: gallery modal (thumbnails + zoomable image + actions)
  const { isOpen, images, activeId, modalType } = useAppSelector(galleryModalSelector)
  const isMobile = useAppSelector(isMobileSelector)

  // Block the screen underneath from scrolling while the viewer is open: a
  // wheel/touch the viewer can't consume (over the dim backdrop or image) is
  // cancelled so it never scrolls the page behind or chains out of the iframe.
  // Scrolling the thumbnail strip still works (it can consume the gesture).
  const modalRef = useRef<HTMLDivElement>(null)
  usePreventParentScroll(isOpen || !!fullScreenImageUrl, isMobile, modalRef)

  // Wheel/trackpad gestures over the central image (un-zoomed) or the backdrop
  // are forwarded to the thumbnail strip, so the whole center scrolls the strip.
  const thumbWheelApi = useRef<ThumbnailWheelApi | null>(null)
  const handleCenterWheel = useCallback((e: React.WheelEvent) => {
    const api = thumbWheelApi.current
    if (!api) return
    // A wheel directly on the strip is handled by the strip itself; a zoomed
    // image stops propagation — so reaching here means the backdrop or an
    // un-zoomed image. Forward it to the strip.
    if ((e.target as Element).closest?.(`.${styles.leftContent}`)) return
    api.scrollByWheel(e.deltaY, e.deltaX, e.deltaMode)
  }, [])

  const activeUrl = isOpen
    ? (images.find((image) => image.id === activeId)?.url ?? images[0]?.url)
    : undefined

  // Detect an image switch DURING render (not in an effect) so the outgoing
  // image's layer is already in the same commit that mounts the new one —
  // otherwise there's a blank frame between unmount and the effect firing.
  const shownUrlRef = useRef<string | undefined>(undefined)
  if (!isOpen) {
    shownUrlRef.current = undefined
  } else if (activeUrl !== shownUrlRef.current) {
    if (shownUrlRef.current && activeUrl) setPrevUrl(shownUrlRef.current)
    shownUrlRef.current = activeUrl
  }

  // Hold the outgoing image for at most 100ms (the new one usually becomes
  // ready first and clears it via handleImageBox)
  useEffect(() => {
    if (!prevUrl) return
    const t = setTimeout(() => setPrevUrl(null), 100)
    return () => clearTimeout(t)
  }, [prevUrl])

  // Reset when the gallery closes
  useEffect(() => {
    if (!isOpen) setPrevUrl(null)
  }, [isOpen])

  const { data: generations = [] } = useGenerationsData()
  const { mutate: deleteGenerations } = useDeleteGeneratedImages()

  const closeMobile = useCallback(() => {
    dispatch(uploadsSlice.actions.showImageFullScreen(null))
  }, [dispatch])

  const closeGallery = useCallback(() => {
    setConfirmDelete(false)
    dispatch(galleryModalSlice.actions.closeGalleryModal())
  }, [dispatch])

  // Keyboard navigation for the desktop gallery: arrows step through the images
  // (clamped at the ends), Escape closes.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGallery()
        return
      }
      if (images.length < 2) return
      const idx = images.findIndex((image) => image.id === activeId)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const target = images[Math.max(0, idx - 1)]
        if (target.id !== activeId) {
          dispatch(galleryModalSlice.actions.setActiveGalleryImage(target.id))
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const target = images[Math.min(images.length - 1, idx + 1)]
        if (target.id !== activeId) {
          dispatch(galleryModalSlice.actions.setActiveGalleryImage(target.id))
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, images, activeId, dispatch, closeGallery])

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
      <div
        ref={modalRef}
        className={styles.fullScreenModal}
        data-testid="aiuta-fullscreen-gallery"
      >
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
        ref={modalRef}
        className={styles.advancedFullScreenModal}
        data-testid="fullscreen-gallery"
        // Clicking the dark backdrop (not the image or controls) closes
        onClick={(e) => {
          if (e.target === e.currentTarget) closeGallery()
        }}
        onWheel={handleCenterWheel}
      >
        {/* Left sidebar with image thumbnails */}
        <ThumbnailList
          items={images}
          activeId={activeImage.id}
          onItemClick={(item) => dispatch(galleryModalSlice.actions.setActiveGalleryImage(item.id))}
          variant="fullscreen"
          direction="vertical"
          className={styles.leftContent}
          wheelApiRef={thumbWheelApi}
        />

        {/* Center content: the active image (crossfaded on switch) */}
        <div
          className={combineClassNames(
            styles.centerContent,
            !hasThumbnails && styles.centerContent_noThumbnails,
          )}
        >
          <div className={styles.zoomArea}>
            {prevUrl && prevUrl !== activeImage.url && (
              <img src={prevUrl} alt="" aria-hidden="true" className={styles.prevImage} />
            )}
            <ZoomableImage
              key={activeImage.url}
              src={activeImage.url}
              alt="Full Screen Image"
              tapToClose={false}
              onClose={closeGallery}
              onImageBox={handleImageBox}
              // At fit, a plain wheel/trackpad scroll bubbles to the thumbnail
              // strip (priority); pinch (ctrl+wheel) and double-click zoom, and
              // once zoomed in the wheel pans/zooms (no longer forwarded).
              deferWheelAtFit
            />
          </div>
        </div>

        {/* Fixed bottom-right in the reserved strip — not tied to the image */}
        <ActionButtonsPanel
          onShare={() => openShareModal(activeImage.url)}
          onDownload={() => downloadImage(activeImage.url)}
          onDelete={() => setConfirmDelete(true)}
          showDelete={showDelete}
        />

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

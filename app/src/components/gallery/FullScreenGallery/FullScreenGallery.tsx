import React, { useEffect, useState, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { fullScreenImageUrlSelector } from '@/store/slices/uploadsSlice'
import { Share, ThumbnailList, RemoteImage, IconButton } from '@/components'
import { useShare, useLogger } from '@/contexts'
import { ActionButtonsPanel } from './components/ActionButtonsPanel'
import { FullScreenImageViewer } from './components/FullScreenImageViewer'
import { ImageType, FullScreenModalData } from './types'
import { icons } from './icons'
import styles from './FullScreenGallery.module.scss'

export const FullScreenGallery = () => {
  const dispatch = useAppDispatch()
  const logger = useLogger()
  const [modalData, setModalData] = useState<FullScreenModalData | null>(null)
  const { openShareModal, isVisible: isShareVisible } = useShare()

  const fullScreenImageUrl = useAppSelector(fullScreenImageUrlSelector)

  // Listen for fullscreen modal messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // TODO: Replace with RPC event - event.data?.action === 'openFullScreenModal'
      if (event.data?.action === 'OPEN_AIUTA_FULL_SCREEN_MODAL') {
        setModalData(event.data.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleCloseModal = useCallback(() => {
    setModalData(null)
    dispatch(uploadsSlice.actions.showImageFullScreen(null))
  }, [dispatch])

  const handleDownloadImage = useCallback(async () => {
    if (!modalData?.activeImage) return

    try {
      const response = await fetch(modalData.activeImage.url, { mode: 'cors' })
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
  }, [modalData])

  const handleShareImage = useCallback(() => {
    if (!modalData?.activeImage) return

    // Open Share modal
    openShareModal(modalData.activeImage.url)
  }, [modalData, openShareModal])

  const handleDeleteImage = useCallback(() => {
    if (!modalData?.activeImage || !modalData?.images) return

    const deleteActiveImage = modalData.images.filter(
      (image) => image.id !== modalData.activeImage.id,
    )

    if (deleteActiveImage.length > 0) {
      const newActiveImage = deleteActiveImage[0]
      setModalData((prev) =>
        prev ? { ...prev, activeImage: newActiveImage, images: deleteActiveImage } : null,
      )
    } else {
      handleCloseModal()
    }

    // Notify parent about deletion
    // TODO: Replace with RPC call to SDK
    // await rpc.sdk.removeImages({
    //   type: modalData.modalType === 'history' ? 'history' : 'uploads',
    //   imageIds: deleteActiveImage.map(img => img.id)
    // })

    logger.warn('Image removal: Legacy messaging removed, implement RPC method removeImages')
  }, [modalData, handleCloseModal, logger])

  const changeActiveImage = useCallback(
    (image: ImageType) => {
      if (modalData) {
        setModalData((prev) => (prev ? { ...prev, activeImage: image } : null))
      }
    },
    [modalData],
  )

  // Render simple fullscreen for single image (existing behavior)
  if (fullScreenImageUrl && !modalData) {
    return (
      <div
        className={styles.fullScreenModal}
        onClick={(e) => {
          e.stopPropagation()
          handleCloseModal()
        }}
        data-testid="aiuta-fullscreen-gallery"
      >
        <IconButton
          icon='<path d="M18.9495 5.05C19.3401 5.44052 19.3401 6.07369 18.9495 6.46421L13.4142 11.9995L18.9502 17.5355C19.3404 17.926 19.3404 18.5593 18.9502 18.9498C18.5598 19.3402 17.9266 19.34 17.536 18.9498L12 13.4137L6.46399 18.9498C6.07344 19.34 5.44021 19.3402 5.04978 18.9498C4.65955 18.5593 4.65958 17.926 5.04978 17.5355L10.5858 11.9995L5.05047 6.46421C4.65994 6.07369 4.65994 5.44052 5.05047 5.05C5.44101 4.65969 6.07423 4.65955 6.46468 5.05L12 10.5853L17.5353 5.05C17.9258 4.65954 18.559 4.65969 18.9495 5.05Z" fill="currentColor"/>'
          label="Close fullscreen image"
          onClick={(e) => {
            e?.stopPropagation()
            handleCloseModal()
          }}
          className={styles.closeButton}
          size={20}
        />
        <RemoteImage
          src={fullScreenImageUrl}
          alt="Full Screen Image"
          shape={null}
          className={styles.fullImage}
          onClick={(e) => {
            e?.stopPropagation()
            handleCloseModal()
          }}
        />
      </div>
    )
  }

  // Render advanced fullscreen modal
  if (modalData) {
    return (
      <div className={styles.advancedFullScreenModal} data-testid="fullscreen-gallery">
        {/* Left sidebar with image thumbnails */}
        <ThumbnailList
          items={modalData.images || []}
          activeId={modalData.activeImage.id}
          onItemClick={(item) => changeActiveImage(item as ImageType)}
          variant="fullscreen"
          direction="vertical"
          className={styles.leftContent}
        />

        {/* Center content with image and action buttons */}
        <div className={styles.centerContent}>
          <FullScreenImageViewer imageUrl={modalData.activeImage.url} />
          <ActionButtonsPanel
            onShare={handleShareImage}
            onDownload={handleDownloadImage}
            onDelete={handleDeleteImage}
            showDelete={!!modalData.modalType}
          />
        </div>

        {/* Right content with close button */}
        <div className={styles.rightContent}>
          <IconButton
            icon={icons.close}
            label="Close"
            size={24}
            viewBox="0 0 24 24"
            className={styles.closeButton}
            onClick={handleCloseModal}
          />
        </div>

        {/* Share overlay */}
        {isShareVisible && (
          <div className={styles.shareModalOverlay}>
            <Share />
          </div>
        )}
      </div>
    )
  }

  // If no data available, don't render anything
  return null
}

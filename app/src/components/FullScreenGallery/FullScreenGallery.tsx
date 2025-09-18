import React, { useEffect, useState, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { uploadsSlice } from '@/store/slices/uploadsSlice'
import { fullScreenImageUrlSelector } from '@/store/slices/uploadsSlice'

// TODO: Replace with RPC - need to support:
// 1. Modal opening from SDK: openFullScreenModal(data: { images: InputImage[], modalType?: string })
// 2. Image removal: removeImages(action: 'history' | 'uploads', imageIds: string[])
import { useRpcProxy } from '@/contexts'
import { ShareModal, ThumbnailList } from '@/components'
import { ActionButtonsPanel } from './components/ActionButtonsPanel'
import { FullScreenImageViewer } from './components/FullScreenImageViewer'
import { ImageType, FullScreenModalData } from './types'
import styles from './FullScreenGallery.module.scss'

export const FullScreenGallery = () => {
  const dispatch = useAppDispatch()
  const [modalData, setModalData] = useState<FullScreenModalData | null>(null)
  const [shareModalData, setShareModalData] = useState<{ imageUrl: string } | null>(null)
  const rpc = useRpcProxy()

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

    // Notify parent to close modal via RPC
    rpc.sdk.closeModal()
  }, [dispatch, rpc])

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
      console.error('Failed to download image:', error)
    }
  }, [modalData])

  const handleShareImage = useCallback(() => {
    if (!modalData?.activeImage) return

    // Open ShareModal as overlay within the same iframe
    setShareModalData({ imageUrl: modalData.activeImage.url })
  }, [modalData])

  const handleCloseShareModal = useCallback(() => {
    setShareModalData(null)
  }, [])

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

    console.warn('Image removal: Legacy messaging removed, implement RPC method removeImages')
  }, [modalData, handleCloseModal])

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
      <div className={styles.fullScreenModal}>
        <div className={styles.closeIconBox} onClick={handleCloseModal}>
          <img src={'./icons/close.svg'} alt="Close Icon" className={styles.closeIcon} />
        </div>
        <img
          width={100}
          height={100}
          alt="Full Screen Image"
          src={fullScreenImageUrl}
          className={styles.fullImage}
        />
      </div>
    )
  }

  // Render advanced fullscreen modal
  if (modalData) {
    return (
      <div className={styles.advancedFullScreenModal}>
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
          <img
            src="./icons/close.svg"
            alt="Close"
            className={styles.closeButton}
            onClick={handleCloseModal}
          />
        </div>

        {/* ShareModal overlay */}
        {shareModalData && (
          <div className={styles.shareModalOverlay}>
            <ShareModal imageUrl={shareModalData.imageUrl} onClose={handleCloseShareModal} />
          </div>
        )}
      </div>
    )
  }

  // If this is a modal-only iframe but no data, show a loading state
  const urlParams = new URLSearchParams(window.location.search)
  const isModalOnly = urlParams.get('modal') === 'fullscreen'

  if (isModalOnly && !modalData && !fullScreenImageUrl) {
    return (
      <div className={styles.advancedFullScreenModal}>
        {/* Loading state with same semi-transparent background as loaded modal */}
      </div>
    )
  }

  return null
}

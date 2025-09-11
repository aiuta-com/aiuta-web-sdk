import React, { useEffect, useState, useCallback } from 'react'
// redux
import { useAppSelector, useAppDispatch } from '@/store/store'

// actions
import { fileSlice } from '@/store/slices/fileSlice'

// selectors
import { fullScreenImageUrlSelector } from '@/store/slices/fileSlice/selectors'

// messaging
// TODO: Replace with RPC - need to support:
// 1. Modal opening from SDK: openFullScreenModal(data: { images: UploadedImage[], modalType?: string })
// 2. Image removal: removeImages(action: 'history' | 'uploads', imageIds: string[])
import { useRpcProxy } from '@/contexts'

// components
import { ShareModal } from '@/components/shareModal/shareModal'

// styles
import styles from './fullScreenImageModal.module.scss'

type ImageType = {
  id: string
  url: string
}

type ModalTypes = 'history' | 'previously'

interface FullScreenModalData {
  activeImage: ImageType
  images?: Array<ImageType>
  modalType?: ModalTypes
}

export const FullScreenImageModal = () => {
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
    dispatch(fileSlice.actions.setFullScreenImageUrl(null))

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
        {modalData.images && modalData.images.length > 1 && (
          <div className={styles.leftContent}>
            {modalData.images.map((image) => (
              <div
                key={image.id}
                className={`${styles.miniImageBox} ${
                  image.id === modalData.activeImage.id ? styles.active : ''
                }`}
                onClick={() => changeActiveImage(image)}
              >
                <img src={image.url} alt="Thumbnail" className={styles.miniImage} />
                <div className={styles.miniImageBorder} />
              </div>
            ))}
          </div>
        )}

        {/* Center content with image and action buttons */}
        <div className={styles.centerContent}>
          <div className={styles.imageContainer}>
            <img
              src={modalData.activeImage.url}
              alt="Full Screen Image"
              className={styles.activeImage}
            />

            {/* Action buttons positioned to the right of the image */}
            <div className={styles.actionButtons}>
              <div className={styles.actionButton} onClick={handleShareImage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M4.29828 10.6779L22.5555 5.83326L16.8669 23.2464L12.8333 15.1666L4.29828 10.6779Z"
                    stroke="white"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.9519 12.2855C17.2937 11.9438 17.2937 11.3897 16.9519 11.048C16.6102 10.7063 16.0562 10.7063 15.7145 11.048L16.3332 11.6667L16.9519 12.2855ZM12.4443 15.5556L13.0631 16.1744L16.9519 12.2855L16.3332 11.6667L15.7145 11.048L11.8256 14.9369L12.4443 15.5556Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className={styles.actionButton} onClick={handleDownloadImage}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M24.5 15.1667V19.8334C24.5 20.4523 24.2542 21.0457 23.8166 21.4833C23.379 21.9209 22.7855 22.1667 22.1667 22.1667H5.83333C5.21449 22.1667 4.621 21.9209 4.18342 21.4833C3.74583 21.0457 3.5 20.4523 3.5 19.8334V15.1667"
                    stroke="white"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.16699 10.1111L14.0003 15.9444L19.8337 10.1111"
                    stroke="white"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 16.3334L14 3.88892"
                    stroke="white"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {modalData.modalType && (
                <div className={styles.actionButton} onClick={handleDeleteImage}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                  >
                    <path
                      d="M3.5 7H5.83333H24.5"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22.1663 6.99992V23.3333C22.1663 23.9521 21.9205 24.5456 21.4829 24.9832C21.0453 25.4208 20.4518 25.6666 19.833 25.6666H8.16634C7.5475 25.6666 6.95401 25.4208 6.51643 24.9832C6.07884 24.5456 5.83301 23.9521 5.83301 23.3333V6.99992M9.33301 6.99992V4.66659C9.33301 4.04775 9.57884 3.45425 10.0164 3.01667C10.454 2.57908 11.0475 2.33325 11.6663 2.33325H16.333C16.9518 2.33325 17.5453 2.57908 17.9829 3.01667C18.4205 3.45425 18.6663 4.04775 18.6663 4.66659V6.99992"
                      stroke="white"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right content with close button */}
        <div className={styles.rightContent}>
          <div className={styles.closeButton} onClick={handleCloseModal}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M27.1924 8.77808C26.8019 8.38756 26.1687 8.38756 25.7782 8.77808L18 16.5563L10.2218 8.77808C9.8313 8.38756 9.19814 8.38756 8.80761 8.77808C8.41709 9.1686 8.41709 9.80177 8.80761 10.1923L16.5858 17.9705L8.80761 25.7486C8.41709 26.1392 8.41709 26.7723 8.80761 27.1629C9.19814 27.5534 9.8313 27.5534 10.2218 27.1629L18 19.3847L25.7782 27.1629C26.1687 27.5534 26.8019 27.5534 27.1924 27.1629C27.5829 26.7723 27.5829 26.1392 27.1924 25.7486L19.4142 17.9705L27.1924 10.1923C27.5829 9.80177 27.5829 9.16861 27.1924 8.77808Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* ShareModal overlay */}
        {shareModalData && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10000,
            }}
          >
            <ShareModal imageUrl={shareModalData.imageUrl} onClose={handleCloseShareModal} />
          </div>
        )}
      </div>
    )
  }

  // If this is a modal-only iframe but no data, show a loading state
  const urlParams = new URLSearchParams(window.location.search)
  const isModalOnly = urlParams.get('modal') === 'true'

  if (isModalOnly && !modalData && !fullScreenImageUrl) {
    return (
      <div className={styles.advancedFullScreenModal}>
        {/* Loading state with same semi-transparent background as loaded modal */}
      </div>
    )
  }

  return null
}

import React, { useState } from 'react'
import { PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { Confirmation } from '@/components'
import { useUploadsGallery } from '@/hooks'
import styles from './UploadsHistory.module.scss'

/**
 * Desktop version of uploads history page
 */
export default function UploadsHistoryDesktop() {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleShowModal = () => setIsModalVisible(true)
  const handleCloseModal = () => setIsModalVisible(false)

  const gallery = useUploadsGallery({
    onCloseModal: () => setIsModalVisible(false),
    onShowDeleteModal: handleShowModal,
  })

  return (
    <main className={styles.uploadsHistory}>
      <ImageGallery
        images={gallery.images}
        onImageClick={gallery.handleImageClick}
        galleryType="uploads"
        className={styles.imageGallery}
      />

      <SelectionSnackbar
        isVisible={gallery.isSelecting}
        selectedCount={gallery.selectedCount}
        totalCount={gallery.totalCount}
        onCancel={gallery.onCancel}
        onSelectAll={gallery.onSelectAll}
        onDelete={gallery.onDelete}
      />

      <Confirmation
        isVisible={isModalVisible}
        message="Are you sure you want to delete these uploads?"
        leftButtonText="Keep"
        rightButtonText="Delete"
        onLeftClick={handleCloseModal}
        onRightClick={gallery.deleteSelectedImages}
      />

      <PrimaryButton onClick={gallery.navigateToUpload} className={styles.uploadButton}>
        + Upload new photo
      </PrimaryButton>
    </main>
  )
}

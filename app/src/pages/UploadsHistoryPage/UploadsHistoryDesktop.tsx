import React, { useState } from 'react'
import { PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { ConfirmationAlert } from '@/components'
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
    <>
      <div className={styles.viewContent}>
        <ImageGallery
          images={gallery.images}
          variant="uploaded"
          onImageClick={gallery.handleImageClick}
          onImageDelete={gallery.handleImageDelete}
          enableSelection={gallery.isSelectPreviouslyImages}
          galleryType="uploads"
          emptyMessage="Upload your first photo to see it here"
          className={styles.imageContent}
        />

        <SelectionSnackbar
          isVisible={gallery.hasSelection}
          isMobile={false}
          className={styles.historyBanner}
          selectedCount={gallery.selectedCount}
          totalCount={gallery.totalCount}
          onCancel={gallery.onCancel}
          onSelectAll={gallery.onSelectAll}
          actions={gallery.selectionActions}
        />

        <ConfirmationAlert
          isVisible={isModalVisible}
          message="Are you sure you want to delete these uploads?"
          leftButtonText="Keep"
          rightButtonText="Delete"
          onLeftClick={handleCloseModal}
          onRightClick={gallery.deleteSelectedImages}
        />
      </div>

      <PrimaryButton onClick={gallery.navigateToUpload} className={styles.uploadButton}>
        + Upload new photo
      </PrimaryButton>
    </>
  )
}

import React, { useState } from 'react'
import { Section, PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { ConfirmationAlert } from '@/components'
import { useUploadsGallery } from '@/hooks'
import styles from './UploadsHistory.module.scss'

/**
 * Mobile version of uploads history page
 */
export default function UploadsHistoryMobile() {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleShowModal = () => setIsModalVisible(true)
  const handleCloseModal = () => setIsModalVisible(false)

  const gallery = useUploadsGallery({
    onCloseModal: () => setIsModalVisible(false),
    onShowDeleteModal: handleShowModal,
  })

  return (
    <Section className={styles.sectionContent}>
      <div className={styles.viewContent}>
        <ImageGallery
          images={gallery.images}
          onImageClick={gallery.handleImageClick}
          galleryType="uploads"
          className={styles.imageContent}
        />

        <SelectionSnackbar
          isVisible={gallery.hasSelection}
          className={styles.historyBanner}
          selectedCount={gallery.selectedCount}
          totalCount={gallery.totalCount}
          onCancel={gallery.onCancel}
          onSelectAll={gallery.onSelectAll}
          onDelete={gallery.onDelete}
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
    </Section>
  )
}

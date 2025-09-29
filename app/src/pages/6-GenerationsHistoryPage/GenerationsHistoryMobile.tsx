import React, { useState } from 'react'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { Confirmation } from '@/components'
import { useGenerationsGallery } from '@/hooks'
import styles from './GenerationsHistory.module.scss'

/**
 * Mobile version of generations history page
 */
export default function GenerationsHistoryMobile() {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleShowModal = () => setIsModalVisible(true)
  const handleCloseModal = () => setIsModalVisible(false)

  const gallery = useGenerationsGallery({
    onCloseModal: () => setIsModalVisible(false),
    onShowDeleteModal: handleShowModal,
  })

  return (
    <main className={styles.generationsHistory}>
      <ImageGallery
        images={gallery.images}
        onImageClick={gallery.handleImageClick}
        galleryType="generations"
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
        onDownload={gallery.onDownload}
      />

      <Confirmation
        isVisible={isModalVisible}
        message="Are you sure you want to delete these try-ons?"
        leftButtonText="Keep"
        rightButtonText="Delete"
        onLeftClick={handleCloseModal}
        onRightClick={gallery.deleteSelectedImages}
      />
    </main>
  )
}

import React, { useState } from 'react'
import { ImageGallery, SelectionSnackbar, Confirmation } from '@/components'
import { useGenerationsGallery } from '@/hooks'
import styles from './GenerationsHistory.module.scss'

/**
 * GenerationsHistoryPage - gallery of generated try-on images
 *
 * Features:
 * - View generated try-on results
 * - Select multiple images for deletion
 * - Full-screen image viewing
 * - Bulk image management
 */
export default function GenerationsHistoryPage() {
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
      />

      <SelectionSnackbar
        isVisible={gallery.isSelecting}
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

import React, { useState } from 'react'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { ConfirmationAlert } from '@/components'
import { useGenerationsGallery } from '@/hooks'

/**
 * Desktop version of generations history page
 */
export default function GenerationsHistoryDesktop() {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleShowModal = () => setIsModalVisible(true)
  const handleCloseModal = () => setIsModalVisible(false)

  const gallery = useGenerationsGallery({
    onCloseModal: () => setIsModalVisible(false),
    onShowDeleteModal: handleShowModal,
  })

  return (
    <>
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

      <ConfirmationAlert
        isVisible={isModalVisible}
        message="Are you sure you want to delete these try-ons?"
        leftButtonText="Keep"
        rightButtonText="Delete"
        onLeftClick={handleCloseModal}
        onRightClick={gallery.deleteSelectedImages}
      />
    </>
  )
}

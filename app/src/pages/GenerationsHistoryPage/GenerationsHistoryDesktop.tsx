import React, { useState } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { ConfirmationAlert } from '@/components'
import { useGenerationsGallery } from '@/hooks'
import styles from './generationsHistory.module.scss'

const animationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeInOut },
}

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
    <Section className={styles.sectionContent}>
      <motion.div
        key="generations-history-desktop"
        className={styles.viewContent}
        {...animationConfig}
      >
        <ImageGallery
          images={gallery.images}
          variant="generated"
          onImageClick={gallery.handleImageClick}
          galleryType="generations"
          emptyMessage="Once you try on first item your try-on history would be stored here"
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
          message="Are you sure you want to delete these try-ons?"
          leftButtonText="Keep"
          rightButtonText="Delete"
          onLeftClick={handleCloseModal}
          onRightClick={gallery.deleteSelectedImages}
        />
      </motion.div>
    </Section>
  )
}

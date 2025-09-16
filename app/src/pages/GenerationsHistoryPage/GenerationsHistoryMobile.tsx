import React, { useState } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { HistoryImagesRemoveModal } from '@/components'
import { useGenerationsGallery } from '@/hooks'
import styles from './generationsHistory.module.scss'

const animationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeInOut },
}

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
    <Section className={styles.sectionContent}>
      <motion.div
        key="generations-history-mobile"
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
          isMobile
        />

        <SelectionSnackbar
          isVisible={gallery.hasSelection}
          isMobile={gallery.isMobile}
          className={styles.historyBanner}
          selectedCount={gallery.selectedCount}
          totalCount={gallery.totalCount}
          onCancel={gallery.onCancel}
          onSelectAll={gallery.onSelectAll}
          actions={gallery.selectionActions}
        />

        <HistoryImagesRemoveModal
          isVisible={isModalVisible}
          onClickRightButton={gallery.deleteSelectedImages}
          onClickLeftButton={handleCloseModal}
        />
      </motion.div>
    </Section>
  )
}

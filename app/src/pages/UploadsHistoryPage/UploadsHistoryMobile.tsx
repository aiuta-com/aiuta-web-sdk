import React, { useState } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section, PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { HistoryImagesRemoveModal } from '@/components'
import { useUploadsGallery } from '@/hooks'
import styles from './uploadsHistory.module.scss'

const animationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeInOut },
}

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
      <motion.div key="uploads-history-mobile" className={styles.viewContent} {...animationConfig}>
        <ImageGallery
          images={gallery.images}
          variant="uploaded"
          onImageClick={gallery.handleImageClick}
          onImageDelete={gallery.handleImageDelete}
          enableSelection={gallery.isSelectPreviouslyImages}
          galleryType="uploads"
          emptyMessage="Upload your first photo to see it here"
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

      <PrimaryButton onClick={gallery.navigateToUpload} className={styles.uploadButton}>
        + Upload new photo
      </PrimaryButton>
    </Section>
  )
}

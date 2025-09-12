import React, { useState } from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components'
import { ImageGallery, SelectionBanner } from '@/components'
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

  const { images, handleImageClick, hasSelection, isMobile, deleteSelectedImages } =
    useGenerationsGallery({
      onCloseModal: () => setIsModalVisible(false),
    })

  const handleShowModal = () => setIsModalVisible(true)
  const handleCloseModal = () => setIsModalVisible(false)

  return (
    <Section className={styles.sectionContent}>
      <motion.div
        key="generations-history-mobile"
        className={styles.viewContent}
        {...animationConfig}
      >
        <ImageGallery
          images={images}
          variant="history"
          onImageClick={handleImageClick}
          emptyMessage="Once you try on first item your try-on history would be stored here"
          className={styles.imageContent}
          isMobile
        />

        <SelectionBanner
          hasSelection={hasSelection}
          isMobile={isMobile}
          className={styles.historyBanner}
          onShowModal={handleShowModal}
        />

        <HistoryImagesRemoveModal
          isVisible={isModalVisible}
          onClickRightButton={deleteSelectedImages}
          onClickLeftButton={handleCloseModal}
        />
      </motion.div>
    </Section>
  )
}

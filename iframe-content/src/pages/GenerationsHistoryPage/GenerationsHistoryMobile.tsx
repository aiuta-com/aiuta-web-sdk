import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components/feature'
import { ImageGallery, SelectionBanner } from '@/components/shared'
import { HistoryImagesRemoveModal } from '@/components/shared/modals'
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
  const {
    images,
    handleImageClick,
    hasSelection,
    isMobile,
    deleteSelectedImages,
    closeHistoryImagesModal,
  } = useGenerationsGallery()

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
        />

        <HistoryImagesRemoveModal
          onClickRightButton={deleteSelectedImages}
          onClickLeftButton={closeHistoryImagesModal}
        />
      </motion.div>
    </Section>
  )
}

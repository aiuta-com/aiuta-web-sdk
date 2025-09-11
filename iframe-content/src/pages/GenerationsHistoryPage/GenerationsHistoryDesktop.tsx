import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components/feature'
import { ImageGallery, SelectionBanner } from '@/components/shared'
import { HistoryImagesRemoveModal } from '@/components/shared/modals'
import { useGenerationsGallery } from '@/hooks/useGenerationsGallery'
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
  const { images, handleImageClick, hasSelection, deleteSelectedImages, closeHistoryImagesModal } =
    useGenerationsGallery()

  return (
    <Section className={styles.sectionContent}>
      <motion.div
        key="generations-history-desktop"
        className={styles.viewContent}
        {...animationConfig}
      >
        <ImageGallery
          images={images}
          variant="history"
          onImageClick={handleImageClick}
          emptyMessage="Once you try on first item your try-on history would be stored here"
          className={styles.imageContent}
        />

        <SelectionBanner hasSelection={hasSelection} className={styles.historyBanner} />

        <HistoryImagesRemoveModal
          onClickRightButton={deleteSelectedImages}
          onClickLeftButton={closeHistoryImagesModal}
        />
      </motion.div>
    </Section>
  )
}

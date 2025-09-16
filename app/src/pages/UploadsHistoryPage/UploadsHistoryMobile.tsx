import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section, PrimaryButton } from '@/components'
import { ImageGallery } from '@/components'
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
  const { images, handleImageClick, handleImageDelete, navigateToUpload } = useUploadsGallery()

  return (
    <Section className={styles.sectionContent}>
      <motion.div key="uploads-history-mobile" className={styles.viewContent} {...animationConfig}>
        <ImageGallery
          images={images}
          variant="uploaded"
          onImageClick={handleImageClick}
          onImageDelete={handleImageDelete}
          emptyMessage="Upload your first photo to see it here"
          className={styles.imageContent}
          isMobile
        />

        <PrimaryButton onClick={navigateToUpload}>
          + Upload new photo
        </PrimaryButton>
      </motion.div>
    </Section>
  )
}

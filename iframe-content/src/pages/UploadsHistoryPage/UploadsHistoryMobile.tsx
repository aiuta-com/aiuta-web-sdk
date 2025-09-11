import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section, TryOnButton } from '@/components/feature'
import { ImageGallery } from '@/components/shared'
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
  const { images, handleImageClick, handleImageDelete, navigateToUpload, handlePhotoUpload } =
    useUploadsGallery()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await handlePhotoUpload(file)
    }
  }

  return (
    <Section className={styles.sectionContent}>
      <motion.div key="uploads-history-mobile" className={styles.viewContent} {...animationConfig}>
        <ImageGallery
          images={images}
          variant="previously"
          onImageClick={handleImageClick}
          onImageDelete={handleImageDelete}
          emptyMessage="Upload your first photo to see it here"
          className={styles.imageContent}
          isMobile
        />

        <TryOnButton onClick={navigateToUpload}>
          <>
            + Upload new photo
            {!images.length && (
              <label className={styles.changeImageBtn}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </>
        </TryOnButton>
      </motion.div>
    </Section>
  )
}

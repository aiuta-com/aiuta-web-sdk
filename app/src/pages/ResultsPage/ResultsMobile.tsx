import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components'
import { useResultsShare } from '@/hooks'
import styles from './ResultsPage.module.scss'

const animationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeInOut },
}

/**
 * Mobile version of results page with share functionality
 */
export default function ResultsMobile() {
  const { shareImage, handleMobileImageClick, hasImages, firstImage } = useResultsShare()

  if (!hasImages || !firstImage) {
    return null
  }

  return (
    <Section className={styles.mobilePage}>
      <motion.div key="results-mobile" className={styles.resultsContainer} {...animationConfig}>
        <div className={styles.mobileGallery}>
          <div className={styles.mobileImageContainer}>
            <img
              src={firstImage.url}
              alt="Generated result"
              width={280}
              height={460}
              loading="lazy"
              className={styles.resultImage}
              onClick={() => handleMobileImageClick(firstImage.url)}
            />
            <div className={styles.shareButton} onClick={() => shareImage(firstImage.url)}>
              <img src={'./icons/shareMobile.svg'} alt="Share icon" className={styles.shareIcon} />
            </div>
          </div>
        </div>
      </motion.div>
    </Section>
  )
}

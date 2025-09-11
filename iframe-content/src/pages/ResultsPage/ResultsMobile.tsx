import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section, ViewImage } from '@/components/feature'
import { ShareButton } from '@/components/shared'
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
            <ViewImage
              imgUnoptimazed={true}
              isStartGeneration={false}
              className={styles.resultImage}
              url={firstImage.url}
              isShowChangeImageBtn={false}
              onClick={() => handleMobileImageClick(firstImage.url)}
            />
            <ShareButton onShare={() => shareImage(firstImage.url)} />
          </div>
        </div>
      </motion.div>
    </Section>
  )
}

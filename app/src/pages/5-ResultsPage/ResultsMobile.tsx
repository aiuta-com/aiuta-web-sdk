import React from 'react'
import { useResultsShare } from '@/hooks'
import styles from './Results.module.scss'

/**
 * Mobile version of results page with share functionality
 */
export default function ResultsMobile() {
  const { shareImage, handleMobileImageClick, hasImages, firstImage } = useResultsShare()

  if (!hasImages || !firstImage) {
    return null
  }

  return (
    <main className={`${styles.resultsContainer} ${styles.mobilePage}`}>
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
    </main>
  )
}

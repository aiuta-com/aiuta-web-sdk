import React from 'react'
import { motion, easeInOut } from 'framer-motion'
import { Section } from '@/components'
import { DesktopResultActions } from '@/components'
import { ResultsSlider } from '@/components'
import { useResultsGallery } from '@/hooks'
import styles from './ResultsPage.module.scss'

const animationConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: easeInOut },
}

/**
 * Desktop version of results page with synchronized scrolling
 */
export default function ResultsDesktop() {
  const {
    slideItemIndex,
    images,
    generatedImages,
    hasMultipleImages,
    currentImage,
    miniSliderContentRef,
    generatedImagesContentRef,
    handleSliderItemClick,
    handleScrollPositionDetection,
    handleImageClick,
  } = useResultsGallery()

  return (
    <Section>
      <motion.div key="results-desktop" className={styles.resultsContainer} {...animationConfig}>
        <div
          ref={generatedImagesContentRef}
          className={styles.mainGallery}
          onScrollEnd={handleScrollPositionDetection}
        >
          {hasMultipleImages && (
            <div ref={miniSliderContentRef} className={styles.thumbnailSlider}>
              <ResultsSlider
                images={images}
                activeIndex={slideItemIndex}
                onItemClick={handleSliderItemClick}
              />
            </div>
          )}

          {generatedImages.map((image, index) => (
            <div key={image.id} id={String(index)}>
              <img
                src={image.url}
                alt="Generated result"
                width={280}
                height={460}
                loading="lazy"
                className={styles.resultImage}
                onClick={() => handleImageClick(image)}
              />
            </div>
          ))}
        </div>

        {currentImage && <DesktopResultActions activeGeneratedImageUrl={currentImage.url} />}
      </motion.div>
    </Section>
  )
}

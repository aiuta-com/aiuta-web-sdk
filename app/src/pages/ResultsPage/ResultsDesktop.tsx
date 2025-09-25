import React from 'react'
import { Section, ThumbnailList } from '@/components'
import { DesktopResultActions } from '@/components'
import { useResultsGallery } from '@/hooks'
import styles from './ResultsPage.module.scss'

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
      <div className={styles.resultsContainer}>
        <div
          ref={generatedImagesContentRef}
          className={styles.mainGallery}
          onScrollEnd={handleScrollPositionDetection}
        >
          {hasMultipleImages && (
            <div ref={miniSliderContentRef}>
              <ThumbnailList
                items={images.map((img) => ({ id: img.id, url: img.url }))}
                activeId={images[slideItemIndex]?.id}
                onItemClick={(_, index) => handleSliderItemClick(index)}
                direction="horizontal"
                className={styles.thumbnailSlider}
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
      </div>
    </Section>
  )
}

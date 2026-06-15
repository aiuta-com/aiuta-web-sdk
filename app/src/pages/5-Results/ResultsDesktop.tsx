import React from 'react'
import { ResultActions, Disclaimer, Flex, RemoteImage, Feedback } from '@/components'
import { useResultsGallery, useImageTone } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './Results.module.scss'

/**
 * Desktop version of the results page (Figma): the image fills the widget
 * edge-to-edge with the disclaimer strip and feedback icons laid over it,
 * and a row of action tiles below
 */
export default function ResultsDesktop() {
  const { currentImage } = useResultsGallery()
  // Light image bottom → light disclaimer strip with dark text, tinted with
  // the photo's average bottom color. Null while still computing — the strip
  // stays hidden instead of flashing the wrong variant.
  const toneInfo = useImageTone(currentImage?.url)

  return (
    <main className={styles.results}>
      <Flex
        containerClassName={styles.fillContainer}
        contentClassName={combineClassNames('aiuta-image-m', styles.fillContent)}
      >
        <RemoteImage src={currentImage} alt="Try-on image" shape="M" fit="smart" />
        {currentImage && (
          <Feedback
            generatedImageUrl={currentImage.url}
            variant="plain"
            className={styles.feedbackOverlay}
          />
        )}
        {toneInfo && <Disclaimer overlay tone={toneInfo.tone} tint={toneInfo.averageColor} />}
      </Flex>

      {currentImage && <ResultActions activeGeneratedImageUrl={currentImage.url} />}
    </main>
  )
}

import React from 'react'
import { ResultActions, Disclaimer, Flex, RemoteImage, Feedback } from '@/components'
import { useResultsGallery } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './Results.module.scss'

/**
 * Desktop version of the results page (Figma): the image fills the widget
 * edge-to-edge with the disclaimer strip and feedback icons laid over it,
 * and a row of action tiles below
 */
export default function ResultsDesktop() {
  const { currentImage } = useResultsGallery()

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
        <Disclaimer overlay />
      </Flex>

      {currentImage && <ResultActions activeGeneratedImageUrl={currentImage.url} />}
    </main>
  )
}

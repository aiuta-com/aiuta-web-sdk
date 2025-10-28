import React from 'react'
import { ResultActions, Flex, RemoteImage, Feedback } from '@/components'
import { useResultsGallery } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './Results.module.scss'

/**
 * Desktop version of results page with synchronized scrolling
 */
export default function ResultsDesktop() {
  const { slideItemIndex, images, currentImage } = useResultsGallery()

  return (
    <main className={styles.results}>
      <Flex contentClassName={combineClassNames('aiuta-image-l')}>
        <RemoteImage src={images[slideItemIndex]?.url || ''} alt="Try-on image" shape="L" />
        {currentImage && (
          <Feedback generatedImageUrl={currentImage.url} className={styles.feedback} />
        )}
      </Flex>

      {currentImage && <ResultActions activeGeneratedImageUrl={currentImage.url} />}
    </main>
  )
}

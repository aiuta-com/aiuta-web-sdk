import React from 'react'
import { ResultActions, Flex, RemoteImage, Feedback } from '@/components'
import { useResultsGallery, useSwipeGesture } from '@/hooks'
import { combineClassNames } from '@/utils'
import styles from './Results.module.scss'

/**
 * Desktop version of results page with synchronized scrolling
 */
export default function ResultsDesktop() {
  const { slideItemIndex, images, currentImage, handleSliderItemClick } = useResultsGallery()

  const swipeHandlers = useSwipeGesture(({ direction }) => {
    if (direction === 'up' && slideItemIndex < images.length - 1) {
      handleSliderItemClick(slideItemIndex + 1)
    } else if (direction === 'down' && slideItemIndex > 0) {
      handleSliderItemClick(slideItemIndex - 1)
    }
  })

  return (
    <main className={styles.results}>
      <Flex contentClassName={combineClassNames('aiuta-image-l')}>
        <RemoteImage
          src={images[slideItemIndex]?.url || ''}
          alt="Try-on image"
          shape="L"
          {...swipeHandlers}
        />
        {currentImage && (
          <Feedback generatedImageUrl={currentImage.url} className={styles.feedback} />
        )}
      </Flex>

      {currentImage && <ResultActions activeGeneratedImageUrl={currentImage.url} />}
    </main>
  )
}

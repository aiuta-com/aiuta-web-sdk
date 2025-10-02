import React from 'react'
import { Flex, RemoteImage, IconButton, Disclaimer } from '@/components'
import { useResultsGallery, useNavigatorShare, useSwipeGesture } from '@/hooks'
import { combineClassNames } from '@/utils'
import { icons } from './icons'
import styles from './Results.module.scss'

/**
 * Mobile version of results page with share functionality and swipe navigation
 */
export default function ResultsMobile() {
  const { slideItemIndex, images, handleSliderItemClick } = useResultsGallery()
  const { shareImage, handleMobileImageClick } = useNavigatorShare()

  const swipeHandlers = useSwipeGesture(({ direction }) => {
    const isNext = direction === 'left' || direction === 'up'
    const isPrev = direction === 'right' || direction === 'down'

    if (isNext && slideItemIndex < images.length - 1) {
      handleSliderItemClick(slideItemIndex + 1)
    } else if (isPrev && slideItemIndex > 0) {
      handleSliderItemClick(slideItemIndex - 1)
    }
  })

  const currentImageUrl = images[slideItemIndex]?.url || ''

  return (
    <main className={styles.results}>
      <Flex contentClassName={combineClassNames('aiuta-image-l')}>
        <RemoteImage
          src={currentImageUrl}
          alt="Generated result"
          shape="L"
          onClick={() => handleMobileImageClick(currentImageUrl)}
          {...swipeHandlers}
        />
        <IconButton
          icon={icons.share}
          label="Share"
          onClick={() => shareImage(currentImageUrl)}
          className={styles.shareButton}
        />
      </Flex>
      <Disclaimer className={styles.disclaimer} />
    </main>
  )
}

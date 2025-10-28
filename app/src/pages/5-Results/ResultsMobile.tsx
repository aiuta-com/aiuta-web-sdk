import React from 'react'
import { Flex, RemoteImage, IconButton, Disclaimer, Feedback } from '@/components'
import { useResultsGallery, useNavigatorShare } from '@/hooks'
import { combineClassNames } from '@/utils'
import { icons } from './icons'
import styles from './Results.module.scss'

/**
 * Mobile version of results page with share functionality and swipe navigation
 */
export default function ResultsMobile() {
  const { slideItemIndex, images } = useResultsGallery()
  const { shareImage, handleMobileImageClick } = useNavigatorShare()

  const currentImageUrl = images[slideItemIndex]?.url || ''

  return (
    <main className={styles.results}>
      <Flex contentClassName={combineClassNames('aiuta-image-l')}>
        <RemoteImage
          src={currentImageUrl}
          alt="Generated result"
          shape="L"
          onClick={() => handleMobileImageClick(currentImageUrl)}
        />
        <IconButton
          icon={icons.share}
          label="Share"
          onClick={() => shareImage(currentImageUrl)}
          className={styles.shareButton}
        />
        <Feedback generatedImageUrl={currentImageUrl} className={styles.feedback} />
      </Flex>
      <Disclaimer className={styles.disclaimer} />
    </main>
  )
}

import React from 'react'
import { ResultActions, Disclaimer, Flex, RemoteImage, Feedback } from '@/components'
import { useResultsGallery } from '@/hooks'
import { useAppDispatch } from '@/store/store'
import { galleryModalSlice } from '@/store/slices/galleryModalSlice'
import { combineClassNames } from '@/utils'
import styles from './Results.module.scss'

/**
 * Desktop version of the results page (Figma 12340-33737): the image fills the
 * widget edge-to-edge with the feedback icons laid over it, a row of action
 * tiles below, and the fit disclaimer as a footnote at the very bottom.
 */
export default function ResultsDesktop() {
  const dispatch = useAppDispatch()
  const { currentImage, images } = useResultsGallery()

  const openFullScreen = () => {
    if (!currentImage) return
    dispatch(
      galleryModalSlice.actions.openGalleryModal({
        images: images.map(({ id, url }) => ({ id, url })),
        activeId: currentImage.id,
        modalType: 'results',
      }),
    )
  }

  return (
    <main className={styles.results}>
      <Flex
        fill
        containerClassName={styles.fillContainer}
        contentClassName={combineClassNames('aiuta-image-m', styles.fillContent)}
      >
        <RemoteImage
          src={currentImage}
          alt="Try-on image"
          shape="M"
          fit="smart"
          onClick={openFullScreen}
          style={{ cursor: 'zoom-in' }}
        />
        {currentImage && (
          <Feedback
            generatedImageUrl={currentImage.url}
            variant="plain"
            className={styles.feedbackOverlay}
          />
        )}
      </Flex>

      {currentImage && <ResultActions activeGeneratedImageUrl={currentImage.url} />}
      {currentImage && <Disclaimer variant="plain" />}
    </main>
  )
}

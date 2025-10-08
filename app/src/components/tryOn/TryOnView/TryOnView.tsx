import React, { useState, useEffect, useCallback } from 'react'
import { TryOnStatus, RemoteImage, Flex } from '@/components'
import { combineClassNames } from '@/utils'
import { useImagePickerStrings } from '@/hooks'
import { isNewImage, isInputImage, type TryOnImage } from '@/models'
import styles from './TryOnView.module.scss'

interface TryOnViewProps {
  image: TryOnImage | null
  isGenerating: boolean
  onChangePhoto?: () => void
}

export const TryOnView = ({ image, isGenerating, onChangePhoto }: TryOnViewProps) => {
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()

  // Fix backdrop-filter refresh with minimal opacity change
  const [buttonOpacity, setButtonOpacity] = useState(1)

  // Force backdrop-filter refresh
  const refreshBackdropFilter = () => {
    setButtonOpacity(0.99)
    const timer = setTimeout(() => {
      setButtonOpacity(1)
    }, 16)
    return timer
  }

  // Determine image URL to display
  const imageUrl = image
    ? isNewImage(image)
      ? image.localUrl
      : isInputImage(image)
        ? image.url
        : null
    : null

  // Refresh when image changes
  useEffect(() => {
    if (imageUrl) {
      const timer = refreshBackdropFilter()
      return () => clearTimeout(timer)
    }
  }, [imageUrl])

  // Refresh when image actually loads
  const handleImageLoad = useCallback(() => {
    // Immediate refresh
    refreshBackdropFilter()

    // Delayed refresh to ensure image is fully rendered
    setTimeout(() => {
      refreshBackdropFilter()
    }, 100)

    // Extra delayed refresh as fallback
    setTimeout(() => {
      refreshBackdropFilter()
    }, 300)
  }, [])

  // If there is no image to show
  if (!imageUrl) {
    return null
  }

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l', isGenerating && styles.animation)}>
      <RemoteImage src={imageUrl} alt="Try-on image" shape="L" onLoad={handleImageLoad} />

      {isGenerating && <TryOnStatus className={styles.processingStatus} />}

      {!isGenerating && (
        <button
          className={`aiuta-button-s ${styles.changePhotoButton}`}
          style={{ opacity: buttonOpacity }}
          onClick={onChangePhoto}
        >
          {uploadsHistoryButtonChangePhoto}
        </button>
      )}
    </Flex>
  )
}

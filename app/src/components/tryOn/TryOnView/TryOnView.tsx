import React, { useState, useEffect, useCallback } from 'react'
import { TryOnStatus, RemoteImage, Flex } from '@/components'
import { combineClassNames } from '@/utils'
import { useImagePickerStrings } from '@/hooks'
import styles from './TryOnView.module.scss'

interface TryOnViewProps {
  uploadedImageUrl?: string
  recentImageUrl?: string
  isGenerating: boolean
  onChangePhoto?: () => void
}

export const TryOnView = ({
  uploadedImageUrl,
  recentImageUrl,
  isGenerating,
  onChangePhoto,
}: TryOnViewProps) => {
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()
  const hasInputImage = uploadedImageUrl && uploadedImageUrl.length > 0
  const hasRecentImage = recentImageUrl && recentImageUrl.length > 0

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

  // Refresh when URLs change
  useEffect(() => {
    const timer = refreshBackdropFilter()
    return () => clearTimeout(timer)
  }, [uploadedImageUrl, recentImageUrl])

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

  // Determine which image to show
  const currentImageUrl = hasInputImage ? uploadedImageUrl : hasRecentImage ? recentImageUrl : null

  // If there is an image to show
  if (!currentImageUrl) {
    return null
  }

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l', isGenerating && styles.animation)}>
      <RemoteImage src={currentImageUrl} alt="Try-on image" shape="L" onLoad={handleImageLoad} />

      {isGenerating && (
        <TryOnStatus
          stage={isGenerating ? 'scanning' : 'generating'}
          className={styles.processingStatus}
        />
      )}

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

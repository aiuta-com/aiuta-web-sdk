import React, { useState, useEffect } from 'react'
import { TryOnAnimator, ProcessingStatus } from '@/components'
import { MobileUploadPrompt } from '@/components'
import { InputImage } from '@/utils'
import styles from './ImageManager.module.scss'

interface ImageManagerProps {
  uploadedImage?: {
    id: string
    url: string
    localUrl: string
  }
  recentImage?: InputImage
  isStartGeneration: boolean
  generatedImageUrl: string
  onChangeImage?: () => void
  onUploadClick?: () => void
}

export const ImageManager = ({
  uploadedImage,
  recentImage,
  isStartGeneration,
  generatedImageUrl,
  onChangeImage,
  onUploadClick,
}: ImageManagerProps) => {
  const hasInputImage = uploadedImage && uploadedImage.localUrl.length > 0
  const hasRecentImage = recentImage && recentImage.url.length > 0
  const showChangeButton = !isStartGeneration

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
  }, [uploadedImage?.localUrl, recentImage?.url, generatedImageUrl])

  // Refresh when image actually loads
  const handleImageLoad = () => {
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
  }

  // If there is an uploaded image
  if (hasInputImage) {
    return (
      <div className={styles.imageManager}>
        <TryOnAnimator
          imageUrl={generatedImageUrl || uploadedImage.localUrl}
          isAnimating={isStartGeneration}
          onImageLoad={handleImageLoad}
        />
        <ProcessingStatus
          isVisible={isStartGeneration}
          stage={isStartGeneration ? 'scanning' : 'generating'}
        />
        {showChangeButton && (
          <button
            className={`aiuta-button-s ${styles.changePhotoButton}`}
            style={{ opacity: buttonOpacity }}
            onClick={onChangeImage}
          >
            Change photo
          </button>
        )}
      </div>
    )
  }

  // If there is a recent image
  if (hasRecentImage) {
    return (
      <div className={styles.imageManager}>
        <TryOnAnimator
          imageUrl={generatedImageUrl || recentImage.url}
          isAnimating={isStartGeneration}
          onImageLoad={handleImageLoad}
        />
        <ProcessingStatus
          isVisible={isStartGeneration}
          stage={isStartGeneration ? 'scanning' : 'generating'}
        />
        {showChangeButton && (
          <button
            className={`aiuta-button-s ${styles.changePhotoButton}`}
            style={{ opacity: buttonOpacity }}
            onClick={onChangeImage}
          >
            Change photo
          </button>
        )}
      </div>
    )
  }

  // Empty state (mobile version only)
  if (onUploadClick) {
    return <MobileUploadPrompt onClick={onUploadClick} />
  }

  return null
}

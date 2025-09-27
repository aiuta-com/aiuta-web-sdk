import React, { useState, useEffect } from 'react'
import { TryOnAnimator, ProcessingStatus } from '@/components'
import { MobileUploadPrompt } from '@/components'
import styles from './TryOnViewer.module.scss'

interface TryOnViewerProps {
  uploadedImageUrl?: string
  recentImageUrl?: string
  isGenerating: boolean
  onChangeImage?: () => void
  onUploadClick?: () => void
}

export const TryOnViewer = ({
  uploadedImageUrl,
  recentImageUrl,
  isGenerating,
  onChangeImage,
  onUploadClick,
}: TryOnViewerProps) => {
  const hasInputImage = uploadedImageUrl && uploadedImageUrl.length > 0
  const hasRecentImage = recentImageUrl && recentImageUrl.length > 0
  const showChangeButton = !isGenerating

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

  // Determine which image to show
  const currentImageUrl = hasInputImage ? uploadedImageUrl : hasRecentImage ? recentImageUrl : null

  // If there is an image to show
  if (currentImageUrl) {
    return (
      <div className={styles.tryOnViewer}>
        <TryOnAnimator
          imageUrl={currentImageUrl}
          isAnimating={isGenerating}
          onImageLoad={handleImageLoad}
        />
        <ProcessingStatus
          isVisible={isGenerating}
          stage={isGenerating ? 'scanning' : 'generating'}
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

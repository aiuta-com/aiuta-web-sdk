import React from 'react'
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

  // If there is an uploaded image
  if (hasInputImage) {
    return (
      <div className={styles.imageManager}>
        <TryOnAnimator
          imageUrl={generatedImageUrl || uploadedImage.localUrl}
          isAnimating={isStartGeneration}
        />
        <ProcessingStatus
          isVisible={isStartGeneration}
          stage={isStartGeneration ? 'scanning' : 'generating'}
        />
        {showChangeButton && (
          <button className={styles.changePhotoButton} onClick={onChangeImage}>
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
        />
        <ProcessingStatus
          isVisible={isStartGeneration}
          stage={isStartGeneration ? 'scanning' : 'generating'}
        />
        {showChangeButton && (
          <button className={styles.changePhotoButton} onClick={onChangeImage}>
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

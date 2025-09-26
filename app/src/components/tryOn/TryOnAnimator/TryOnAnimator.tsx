import React, { useCallback, useState } from 'react'
import { TryOnAnimatorProps } from './types'
import styles from './TryOnAnimator.module.scss'

export const TryOnAnimator = ({
  imageUrl,
  isAnimating,
  className,
  onImageLoad,
}: TryOnAnimatorProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageStart = useCallback(() => {
    setImageLoaded(false)
  }, [])

  const handleImageLoad = useCallback(() => {
    // Force a layout recalculation to ensure proper sizing
    requestAnimationFrame(() => {
      // This helps ensure proper sizing after dynamic navigation
    })

    // Mark image as loaded for smooth transition
    setImageLoaded(true)

    // Call external onLoad callback
    onImageLoad?.()
  }, [onImageLoad])

  return (
    <div
      className={`
        ${styles.tryOnAnimator}
        ${isAnimating ? styles.tryOnAnimator_animating : ''}
        ${className || ''}
      `}
    >
      <img
        src={imageUrl}
        alt="Try-on image"
        className={`${styles.image} ${!imageLoaded ? styles.image_loading : ''}`}
        onLoadStart={handleImageStart}
        onLoad={handleImageLoad}
      />
    </div>
  )
}

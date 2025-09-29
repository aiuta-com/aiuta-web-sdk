import React, { useState, useCallback, useEffect, useRef } from 'react'
import { combineClassNames } from '@/utils'
import { CrossFadeImageProps } from './types'
import styles from './CrossFadeImage.module.scss'

export const CrossFadeImage = ({
  src,
  alt,
  className,
  loading = 'lazy',
  onLoad,
  onError,
}: CrossFadeImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [nextSrc, setNextSrc] = useState<string | null>(null)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)
  const [isCurrentLoaded, setIsCurrentLoaded] = useState(false)
  const [isNextLoaded, setIsNextLoaded] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const previousSrc = useRef(src)

  // Handle src changes for cross-fade
  useEffect(() => {
    if (src !== previousSrc.current) {
      if (isCurrentLoaded) {
        if (isTransitioning) {
          // Animation in progress - always update pending to the latest src
          setPendingSrc(src)
        } else {
          // Start transition to new image
          setNextSrc(src)
          setIsNextLoaded(false)
          setIsTransitioning(true)
        }
      } else {
        // First load or current image not loaded yet
        setCurrentSrc(src)
      }
      previousSrc.current = src
    }
  }, [src, isCurrentLoaded, isTransitioning, currentSrc, nextSrc, pendingSrc])

  const handleCurrentLoad = useCallback(() => {
    setIsCurrentLoaded(true)
    if (!isTransitioning) {
      onLoad?.()
    }
  }, [onLoad, isTransitioning])

  const handleNextLoad = useCallback(() => {
    setIsNextLoaded(true)

    // Wait for the fade-in animation to complete before switching
    setTimeout(() => {
      setCurrentSrc(nextSrc!)
      setIsCurrentLoaded(true)
      setNextSrc(null)
      setIsNextLoaded(false)
      setIsTransitioning(false)

      // Use functional update to get current pendingSrc value
      setPendingSrc((currentPendingSrc) => {
        if (currentPendingSrc) {
          // Update previousSrc to ensure we track the latest transition
          previousSrc.current = currentPendingSrc
          // Start next transition immediately
          setTimeout(() => {
            setNextSrc(currentPendingSrc)
            setIsNextLoaded(false)
            setIsTransitioning(true)
          }, 0)
          return null // Clear pendingSrc
        } else {
          onLoad?.()
          return null // Keep pendingSrc as null
        }
      })
    }, 300) // Match the CSS transition duration
  }, [nextSrc, onLoad])

  const handleCurrentError = useCallback(() => {
    setIsCurrentLoaded(false)
    onError?.()
  }, [onError])

  const handleNextError = useCallback(() => {
    // If next image fails, try pending or cancel transition
    if (pendingSrc) {
      const nextPendingSrc = pendingSrc
      setPendingSrc(null)
      setNextSrc(nextPendingSrc)
      setIsNextLoaded(false)
      // Keep isTransitioning true to continue with pending
    } else {
      setNextSrc(null)
      setIsNextLoaded(false)
      setIsTransitioning(false)
      onError?.()
    }
  }, [pendingSrc, onError])

  const containerClasses = combineClassNames(styles.crossFadeImage, className)

  const currentImageClasses = combineClassNames(
    styles.image,
    isCurrentLoaded && styles.image_loaded,
  )

  const nextImageClasses = combineClassNames(styles.image, isNextLoaded && styles.image_loaded)

  return (
    <div className={containerClasses}>
      <img
        src={currentSrc}
        alt={alt}
        className={currentImageClasses}
        loading={loading}
        decoding="async"
        onLoad={handleCurrentLoad}
        onError={handleCurrentError}
      />

      {nextSrc && (
        <img
          src={nextSrc}
          alt={alt}
          className={nextImageClasses}
          loading="eager"
          decoding="async"
          onLoad={handleNextLoad}
          onError={handleNextError}
        />
      )}
    </div>
  )
}

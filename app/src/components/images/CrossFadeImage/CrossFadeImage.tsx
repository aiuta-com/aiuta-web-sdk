import React, { useState, useCallback, useEffect, useRef } from 'react'
import { combineClassNames } from '@/utils'
import { CrossFadeImageProps } from './types'
import styles from './CrossFadeImage.module.scss'

// The largest fraction of the image width that cover is allowed to crop
const MAX_WIDTH_CROP = 1 / 4

/**
 * Picks how to fit an image of the given aspect ratio into the container
 * (both ratios are width/height):
 * - the height is never cropped;
 * - a wider-than-container image may be cropped by width via cover, but only
 *   while the cropped fraction stays under MAX_WIDTH_CROP;
 * - anything else is contained (the caller renders a blurred backdrop).
 */
const resolveFit = (imageRatio: number, containerRatio: number): 'cover' | 'contain' => {
  const coversByWidthOnly = imageRatio >= containerRatio
  // Cover crops 1 - containerRatio/imageRatio of the width
  const widthCropIsAcceptable = imageRatio <= containerRatio / (1 - MAX_WIDTH_CROP)
  return coversByWidthOnly && widthCropIsAcceptable ? 'cover' : 'contain'
}

export const CrossFadeImage = ({
  src,
  alt,
  className,
  loading = 'lazy',
  fit = 'cover',
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

  // Smart fit inputs: the container ratio (kept up to date by a
  // ResizeObserver) and the natural ratio of every image seen so far
  // (recorded on load; reads happen after a load triggers a re-render)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerRatio, setContainerRatio] = useState<number | null>(null)
  const imageRatios = useRef(new Map<string, number>())

  useEffect(() => {
    if (fit !== 'smart' || !containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect && rect.height > 0) {
        const ratio = rect.width / rect.height
        // Ignore sub-1% changes to avoid re-render churn while animating
        setContainerRatio((prev) =>
          prev === null || Math.abs(prev - ratio) / prev > 0.01 ? ratio : prev,
        )
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [fit])

  const recordImageRatio = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) {
      imageRatios.current.set(event.currentTarget.src, naturalWidth / naturalHeight)
    }
  }

  const getFitForSrc = (imageSrc: string): 'cover' | 'contain' => {
    if (fit !== 'smart' || containerRatio === null) return 'cover'
    // The map is keyed by the resolved img.src; fall back to the raw value
    const ratio =
      imageRatios.current.get(imageSrc) ??
      [...imageRatios.current.entries()].find(([key]) => key.endsWith(imageSrc))?.[1]
    return ratio === undefined ? 'cover' : resolveFit(ratio, containerRatio)
  }

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

  const handleCurrentLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      recordImageRatio(event)
      setIsCurrentLoaded(true)
      if (!isTransitioning) {
        onLoad?.()
      }
    },
    [onLoad, isTransitioning],
  )

  const handleNextLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      recordImageRatio(event)
      // Force a small delay to ensure CSS transition starts
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsNextLoaded(true)
        })

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
      })
    },
    [nextSrc, onLoad],
  )

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

  const currentFit = getFitForSrc(currentSrc)
  const nextFit = nextSrc ? getFitForSrc(nextSrc) : 'cover'

  const currentImageClasses = combineClassNames(
    styles.image,
    currentFit === 'contain' && styles.image_contain,
    isCurrentLoaded && styles.image_loaded,
  )

  const nextImageClasses = combineClassNames(
    styles.image,
    nextFit === 'contain' && styles.image_contain,
    isNextLoaded && styles.image_loaded,
  )

  return (
    <div className={containerClasses} ref={containerRef}>
      {currentFit === 'contain' && (
        <img
          src={currentSrc}
          alt=""
          aria-hidden="true"
          className={combineClassNames(
            styles.blurBackdrop,
            isCurrentLoaded && styles.blurBackdrop_loaded,
          )}
          decoding="async"
          draggable={false}
        />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={currentImageClasses}
        loading={loading}
        decoding="async"
        draggable={false}
        onLoad={handleCurrentLoad}
        onError={handleCurrentError}
      />

      {nextSrc && nextFit === 'contain' && (
        <img
          src={nextSrc}
          alt=""
          aria-hidden="true"
          className={combineClassNames(
            styles.blurBackdrop,
            isNextLoaded && styles.blurBackdrop_loaded,
          )}
          decoding="async"
          draggable={false}
        />
      )}
      {nextSrc && (
        <img
          src={nextSrc}
          alt={alt}
          className={nextImageClasses}
          loading="eager"
          decoding="async"
          draggable={false}
          onLoad={handleNextLoad}
          onError={handleNextError}
        />
      )}
    </div>
  )
}

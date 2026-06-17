import React, { useState, useEffect, useCallback } from 'react'
import { TryOnStatus, RemoteImage, Flex, Loader } from '@/components'
import { combineClassNames } from '@/utils'
import { useImagePickerStrings } from '@/hooks'
import { useAppSelector } from '@/store/store'
import { isProcessingImageSelector } from '@/store/slices/tryOnSlice'
import { isNewImage, isInputImage, type TryOnImage } from '@/models'
import styles from './TryOnView.module.scss'

// Delay before showing the loader, so a fast image (jpg/png) that paints almost
// immediately doesn't flash it. Also longer than the cross-fade so a normal
// image swap (its onLoad lands after the ~0.3s transition) never flashes it.
const LOADER_DELAY_MS = 500

interface TryOnViewProps {
  image: TryOnImage | null
  isGenerating: boolean
  /** Overlay change-photo button; omit it when the page renders its own */
  onChangePhoto?: () => void
  /**
   * Fill the available area edge-to-edge with a 16px radius (desktop picker
   * per Figma) instead of the aspect-constrained 24px-radius fit
   */
  fill?: boolean
}

export const TryOnView = ({ image, isGenerating, onChangePhoto, fill = false }: TryOnViewProps) => {
  const { uploadsHistoryButtonChangePhoto } = useImagePickerStrings()

  // Fix backdrop-filter refresh with minimal opacity change
  const [buttonOpacity, setButtonOpacity] = useState(1)

  // A picked file is being prepared (resize / HEIC decode). While it is, the
  // previous image is hidden and a loader is shown instead.
  const isProcessing = useAppSelector(isProcessingImageSelector)

  // Whether the currently selected image has painted. Reset per image, so a new
  // selection shows the loader (not the old image) until the new one is ready.
  const [imageLoaded, setImageLoaded] = useState(false)
  // The loader appears only after LOADER_DELAY_MS of still-not-ready
  const [loaderVisible, setLoaderVisible] = useState(false)

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

  // A new image hasn't painted yet → show the loader until it loads
  useEffect(() => {
    setImageLoaded(false)
    if (imageUrl) {
      const timer = refreshBackdropFilter()
      return () => clearTimeout(timer)
    }
  }, [imageUrl])

  // Refresh when image actually loads. onLoad can fire during a concurrent
  // render (a cached/instant image in React 19), so the first refresh runs in a
  // microtask — out of the render phase (no "setState while rendering" warning)
  // but still this frame, before paint (no visible backdrop flicker).
  const handleImageLoad = useCallback(() => {
    // Defer state updates out of the render phase: onLoad can fire during a
    // concurrent render (cached/instant image in React 19), and a synchronous
    // setState there both warns and forces an extra re-render that flickers the
    // image in Chrome.
    queueMicrotask(() => {
      setImageLoaded(true)
      refreshBackdropFilter()
    })

    // Delayed refreshes to ensure the image is fully rendered
    setTimeout(() => refreshBackdropFilter(), 100)
    setTimeout(() => refreshBackdropFilter(), 300)
  }, [])

  // Loader is wanted while preparing or until the image paints (the generation
  // veil takes over once generation starts), but only shown after a short delay
  const wantsLoader = (isProcessing || (!!imageUrl && !imageLoaded)) && !isGenerating
  useEffect(() => {
    if (!wantsLoader) {
      setLoaderVisible(false)
      return
    }
    const timer = setTimeout(() => setLoaderVisible(true), LOADER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [wantsLoader])

  // Nothing to show and nothing being prepared
  if (!imageUrl && !isProcessing) {
    return null
  }

  // Keep the current image (and its cross-fade) until the loader actually
  // appears — so a fast decode just cross-fades old → new, and only a slow
  // decode unmounts the old image right when the loader shows.
  const showImage = !!imageUrl && !(isProcessing && loaderVisible)

  return (
    <Flex
      fill={fill}
      containerClassName={combineClassNames(fill && styles.fillContainer)}
      contentClassName={combineClassNames(
        fill ? 'aiuta-image-m' : 'aiuta-image-l',
        fill && styles.fillContent,
        // Desktop (fill) shows the Figma gradient veil; mobile keeps the scan
        isGenerating && (fill ? styles.loadingGradient : styles.animation),
      )}
    >
      {showImage && (
        <RemoteImage
          src={imageUrl}
          alt="Try-on image"
          shape={fill ? 'M' : 'L'}
          fit="smart"
          onLoad={handleImageLoad}
        />
      )}

      {loaderVisible && <Loader />}

      {/* On desktop (fill) the page renders the status below the image */}
      {isGenerating && !fill && <TryOnStatus className={styles.processingStatus} />}

      {!isGenerating && !loaderVisible && onChangePhoto && (
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

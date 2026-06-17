import React, { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { combineClassNames } from '@/utils'
import { CrossFadeImageProps } from './types'
import styles from './CrossFadeImage.module.scss'

// The largest fraction of the image width that cover is allowed to crop
const MAX_WIDTH_CROP = 1 / 4
// Side bars this thin (per side) read as an artifact rather than a frame,
// so a barely-narrower image is covered (cropping a bit of height) instead
const MAX_SIDE_BAR_PX = 0
// Matches the layer's CSS opacity transition; how long the outgoing layer is
// kept around to fade out
const FADE_MS = 300

/**
 * Picks how to fit an image of the given aspect ratio (width/height) into
 * the container:
 * - a wider-than-container image may be cropped by width via cover, but only
 *   while the cropped fraction stays under MAX_WIDTH_CROP;
 * - a narrower image is covered (cropping some height) only when containing
 *   it would leave side bars of MAX_SIDE_BAR_PX or thinner;
 * - anything else is contained (a blurred backdrop fills the letterbox).
 */
const resolveFit = (
  imageRatio: number,
  containerWidth: number,
  containerHeight: number,
): 'cover' | 'contain' => {
  const containerRatio = containerWidth / containerHeight
  if (imageRatio >= containerRatio) {
    // Cover crops 1 - containerRatio/imageRatio of the width
    return imageRatio <= containerRatio / (1 - MAX_WIDTH_CROP) ? 'cover' : 'contain'
  }
  // Containing a narrower image leaves two side bars of this width
  const sideBar = (containerWidth * (1 - imageRatio / containerRatio)) / 2
  return sideBar <= MAX_SIDE_BAR_PX ? 'cover' : 'contain'
}

/**
 * Cross-fades between images. Each image + its blur backdrop is one composited
 * "layer" whose opacity is animated, so the (opaque) contained image fully
 * covers its own backdrop — no see-through mush, and the backdrop only reads in
 * the letterbox. On a src change the new layer fades in on top while the
 * previous one stays underneath, then the previous one is removed once the new
 * fully covers it (no dissolve). The previous layer keeps its DOM (keyed by
 * src) so it isn't reloaded/reflashed. Every image appears as one fading-in unit.
 */
export const CrossFadeImage = ({
  src,
  alt,
  className,
  loading = 'lazy',
  fit = 'cover',
  onLoad,
  onError,
}: CrossFadeImageProps) => {
  // currentSrc fades in; prevSrc (if any) is the outgoing layer kept underneath
  const [currentSrc, setCurrentSrc] = useState(src)
  const [prevSrc, setPrevSrc] = useState<string | null>(null)
  // The layer fades in only once BOTH its image and its backdrop are ready, so
  // they appear together as one unit (the backdrop never pops in late).
  const [imageReady, setImageReady] = useState(false)
  const [backdropReady, setBackdropReady] = useState(false)
  const currentSrcRef = useRef(src)
  // Bumped on every src change; a decode() that resolves for a stale src is
  // ignored (its element may already be the outgoing layer).
  const loadToken = useRef(0)

  // Smart fit inputs: the container size (kept up to date by a ResizeObserver)
  // and the natural ratio of every image seen so far (recorded on load).
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)
  const imageRatios = useRef(new Map<string, number>())

  // Measure the container synchronously before the first paint so smart fit is
  // resolved before the image is ever shown. Otherwise the image (and its
  // blurred backdrop) first appears full-bleed as cover, then snaps to contain
  // once the ResizeObserver reports — a large dark flash on mobile.
  useLayoutEffect(() => {
    if (fit !== 'smart' || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setContainerSize((prev) => prev ?? { width: rect.width, height: rect.height })
    }
  }, [fit])

  useEffect(() => {
    if (fit !== 'smart' || !containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (rect && rect.width > 0 && rect.height > 0) {
        // Ignore sub-1% changes to avoid re-render churn while animating
        setContainerSize((prev) =>
          prev === null ||
          Math.abs(prev.width - rect.width) / prev.width > 0.01 ||
          Math.abs(prev.height - rect.height) / prev.height > 0.01
            ? { width: rect.width, height: rect.height }
            : prev,
        )
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [fit])

  // On a src change the old src becomes the outgoing layer (kept fully visible
  // underneath until the new layer has faded in on top), the new becomes the
  // current layer (transparent, fades in once ready). currentSrcRef avoids a
  // render loop without listing it as a dep.
  useEffect(() => {
    if (src === currentSrcRef.current) return
    setPrevSrc(currentSrcRef.current)
    currentSrcRef.current = src
    loadToken.current += 1
    setCurrentSrc(src)
    setImageReady(false)
    setBackdropReady(false)
  }, [src])

  const recordImageRatio = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget
    if (naturalWidth > 0 && naturalHeight > 0) {
      imageRatios.current.set(event.currentTarget.src, naturalWidth / naturalHeight)
    }
  }

  const getFitForSrc = (imageSrc: string): 'cover' | 'contain' => {
    if (fit !== 'smart' || containerSize === null) return 'cover'
    // The map is keyed by the resolved img.src; fall back to the raw value
    const ratio =
      imageRatios.current.get(imageSrc) ??
      [...imageRatios.current.entries()].find(([key]) => key.endsWith(imageSrc))?.[1]
    return ratio === undefined
      ? 'cover'
      : resolveFit(ratio, containerSize.width, containerSize.height)
  }

  // Mark a layer part ready only once it's decoded (ready to paint), not merely
  // loaded: onLoad fires on download, but a separate <img> — especially the
  // blurred backdrop — paints a frame or two later. Gating the fade on load
  // alone reveals the contained image before its backdrop has painted, so the
  // old image shows through the letterbox until the backdrop "arrives".
  const markReadyWhenDecoded = useCallback(
    (img: HTMLImageElement, setReady: (ready: boolean) => void) => {
      const token = loadToken.current
      const finish = () => {
        if (token === loadToken.current) setReady(true)
      }
      if (img.decode) img.decode().then(finish, finish)
      else finish()
    },
    [],
  )

  const handleCurrentLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      recordImageRatio(event)
      markReadyWhenDecoded(event.currentTarget, setImageReady)
      onLoad?.()
    },
    [onLoad, markReadyWhenDecoded],
  )

  const handleBackdropLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      markReadyWhenDecoded(event.currentTarget, setBackdropReady)
    },
    [markReadyWhenDecoded],
  )

  const handleBackdropError = useCallback(() => setBackdropReady(true), [])

  const handleCurrentError = useCallback(() => {
    setImageReady(false)
    onError?.()
  }, [onError])

  const containerClasses = combineClassNames(styles.crossFadeImage, className)

  // The backdrop only exists in smart mode; the layer is "loaded" (ready to
  // fade in) once the image and — when present — the backdrop are both ready.
  const needsBackdrop = fit === 'smart'
  const currentLoaded = imageReady && (!needsBackdrop || backdropReady)

  // Once the new layer is fully shown, drop the outgoing layer (it's covered)
  useEffect(() => {
    if (!currentLoaded || !prevSrc) return
    const timer = setTimeout(() => setPrevSrc(null), FADE_MS)
    return () => clearTimeout(timer)
  }, [currentLoaded, prevSrc])

  const currentFit = getFitForSrc(currentSrc)
  const prevFit = prevSrc ? getFitForSrc(prevSrc) : 'cover'

  return (
    <div className={containerClasses} ref={containerRef}>
      {prevSrc && (
        // Outgoing layer: stays fully opaque underneath while the new layer
        // fades in on top, then is removed once the new one fully covers it
        // (no dissolve). Keyed by src so React reuses the existing
        // (already-loaded) element instead of reloading.
        <div
          key={prevSrc}
          className={combineClassNames(styles.layer, styles.layer_loaded)}
          aria-hidden="true"
        >
          {fit === 'smart' && (
            <img src={prevSrc} alt="" className={styles.blurBackdrop} decoding="async" draggable={false} />
          )}
          <img
            src={prevSrc}
            alt=""
            className={combineClassNames(styles.image, prevFit === 'contain' && styles.image_contain)}
            decoding="async"
            draggable={false}
          />
        </div>
      )}

      <div
        key={currentSrc}
        className={combineClassNames(styles.layer, currentLoaded && styles.layer_loaded)}
      >
        {/* Rendered for every smart image (not just once contain is resolved) so
            it loads/decodes alongside the main image and fades in with the layer
            instead of popping in late. For a cover image it sits hidden behind
            the full-bleed image. */}
        {fit === 'smart' && (
          <img
            src={currentSrc}
            alt=""
            aria-hidden="true"
            className={styles.blurBackdrop}
            decoding="async"
            draggable={false}
            onLoad={handleBackdropLoad}
            onError={handleBackdropError}
          />
        )}
        <img
          src={currentSrc}
          alt={alt}
          className={combineClassNames(styles.image, currentFit === 'contain' && styles.image_contain)}
          loading={loading}
          decoding="async"
          draggable={false}
          onLoad={handleCurrentLoad}
          onError={handleCurrentError}
        />
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'

interface OnboardingVideoProps {
  src: string
  // Shown until the video plays, and used as the static fallback when autoplay
  // is blocked or the video can't load.
  poster: string
  className: string
  title: string
}

/**
 * Looped, muted onboarding video with a robust autoplay path.
 *
 * Why this isn't just a `<video autoPlay muted playsInline>`:
 * - React doesn't reliably set the `muted` *property* from the JSX attribute
 *   (only the attribute), and WebKit/mobile only allow inline autoplay for a
 *   genuinely muted video — so we force `muted` on the DOM node.
 * - The `autoPlay` attribute is ignored by WebKit inside a cross-origin iframe,
 *   so we call `play()` imperatively (and retry once the media can play).
 * - If autoplay is still refused (e.g. iOS Low Power Mode) or the media fails,
 *   we fall back to the poster image instead of leaving a broken native play
 *   button that blanks the video when tapped.
 */
export const OnboardingVideo = ({ src, poster, className, title }: OnboardingVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.defaultMuted = true

    const tryPlay = () => {
      const promise = video.play()
      if (promise && typeof promise.catch === 'function') {
        promise.catch((error: DOMException) => {
          // Autoplay was actively blocked → show the static poster instead of a
          // native play button. Other (transient) errors retry on `canplay`.
          if (error?.name === 'NotAllowedError') setFailed(true)
        })
      }
    }

    const onError = () => setFailed(true)

    tryPlay()
    video.addEventListener('canplay', tryPlay)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('canplay', tryPlay)
      video.removeEventListener('error', onError)
    }
  }, [src])

  if (failed) {
    return <img alt={title} className={className} src={poster} draggable={false} />
  }

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      tabIndex={-1}
      aria-label={title}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

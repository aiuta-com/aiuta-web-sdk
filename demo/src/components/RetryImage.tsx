import React, { useEffect, useRef, useState } from 'react'
import ImageErrorIcon from './icons/ImageErrorIcon'

// The heavy Google Storage images occasionally fail with transient network
// errors — a page reload always fixes them, so a fresh request for the same
// URL is enough. No cache-buster: failed loads aren't cached, and extra query
// params would break the URL if it's ever signed.
const RETRY_DELAY_MS = 1000

interface Props extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string
  /** Reload attempts after the first failure before giving up. */
  retries?: number
  /** What to render once all attempts fail. 'none' is for images whose parent
   *  has its own fallback (e.g. collage → item grid in the outfit card). */
  fallback?: 'icon' | 'none'
}

export default function RetryImage({
  src,
  retries = 2,
  fallback = 'icon',
  className,
  onError,
  ...imgProps
}: Props) {
  const [attempt, setAttempt] = useState(0)
  // A failed <img> left in the DOM renders the browser's own broken-image
  // icon, so the element is dropped entirely while a retry is pending.
  const [waiting, setWaiting] = useState(false)
  const [failed, setFailed] = useState(false)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // New URL → start the attempts over (and drop a pending retry on unmount).
  useEffect(() => {
    setAttempt(0)
    setWaiting(false)
    setFailed(false)
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [src])

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (attempt < retries) {
      setWaiting(true)
      retryTimer.current = setTimeout(() => {
        setWaiting(false)
        setAttempt((current) => current + 1)
      }, RETRY_DELAY_MS)
      return // may still recover — don't report the error yet
    }
    setFailed(true)
    onError?.(event)
  }

  if (waiting) return null

  if (failed) {
    if (fallback === 'none') return null
    return (
      <div
        className={'retry-image-fallback' + (className ? ` ${className}` : '')}
        role="img"
        aria-label={imgProps.alt}
      >
        <ImageErrorIcon className="retry-image-fallback__icon" />
      </div>
    )
  }

  // key remounts the element so the browser issues a fresh request.
  return <img key={attempt} src={src} className={className} onError={handleError} {...imgProps} />
}

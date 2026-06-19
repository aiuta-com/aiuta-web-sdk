import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Icon, CrossFadeImage } from '@/components'
import { combineClassNames } from '@/utils'
import { RemoteImageProps } from './types'
import { icons } from './icons'
import styles from './RemoteImage.module.scss'

// The heavy Google Storage images occasionally fail with transient network
// errors — a fresh request for the same URL is enough to recover. No
// cache-buster: failed loads aren't cached, and extra query params would
// break the URL if it's ever signed.
const RETRY_DELAY_MS = 1000
// Reload attempts after the first failure before showing the error icon
const MAX_RETRIES = 2

export const RemoteImage = ({
  src,
  alt,
  shape,
  className,
  loading = 'lazy',
  fit = 'cover',
  crossFade = true,
  onLoad,
  onError,
  ...rest
}: RemoteImageProps) => {
  const [hasError, setHasError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Extract URL from Image object or use string directly
  const imageUrl =
    typeof src === 'string' ? src : src && typeof src === 'object' && 'url' in src ? src.url : ''

  // Guards async probe results against a src that changed mid-flight
  const imageUrlRef = useRef(imageUrl)

  // New URL → start the attempts over (and drop a pending retry)
  useEffect(() => {
    imageUrlRef.current = imageUrl
    setAttempt(0)
    setHasError(false)
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [imageUrl])

  const handleLoad = useCallback(() => {
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    const urlAtFailure = imageUrl

    const failNow = () => {
      setHasError(true)
      onError?.()
    }

    // Local blobs/data URLs don't support HEAD (it errors with
    // ERR_METHOD_NOT_SUPPORTED) and won't recover on retry — fail immediately.
    if (urlAtFailure.startsWith('blob:') || urlAtFailure.startsWith('data:')) {
      failNow()
      return
    }

    if (attempt >= MAX_RETRIES) {
      failNow()
      return
    }

    const scheduleRetry = () => {
      retryTimer.current = setTimeout(() => setAttempt(attempt + 1), RETRY_DELAY_MS)
    }

    // <img> errors carry no status code, so probe the URL: an explicit 404
    // won't fix itself — skip the retries. A failed probe (CORS, network)
    // says nothing about the resource, so it still counts as transient.
    fetch(urlAtFailure, { method: 'HEAD' })
      .then((response) => {
        if (imageUrlRef.current !== urlAtFailure) return
        if (response.status === 404) failNow()
        else scheduleRetry()
      })
      .catch(() => {
        if (imageUrlRef.current !== urlAtFailure) return
        scheduleRetry()
      })
  }, [attempt, imageUrl, onError])

  // Get shape class based on size, null means no shape class
  const shapeClasses = {
    L: 'aiuta-image-l',
    M: 'aiuta-image-m',
    S: 'aiuta-image-s',
    XS: 'aiuta-image-xs',
  } as const
  const shapeClass = shape ? shapeClasses[shape] : null
  const containerClasses = combineClassNames(shapeClass, styles.remoteImage, className)

  return (
    <div className={containerClasses} {...rest}>
      {imageUrl && !hasError && (
        <CrossFadeImage
          // Remounts on retry so the browser issues a fresh request
          key={attempt}
          src={imageUrl}
          alt={alt}
          loading={loading}
          fit={fit}
          crossFade={crossFade}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {hasError && (
        <Icon icon={icons.error} size={36} viewBox="0 0 36 36" className={styles.errorIcon} />
      )}
    </div>
  )
}

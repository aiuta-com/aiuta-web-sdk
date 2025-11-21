import React, { useState, useCallback } from 'react'
import { Icon, CrossFadeImage } from '@/components'
import { combineClassNames } from '@/utils'
import { RemoteImageProps } from './types'
import { icons } from './icons'
import styles from './RemoteImage.module.scss'

export const RemoteImage = ({
  src,
  alt,
  shape,
  className,
  loading = 'lazy',
  onLoad,
  onError,
  ...rest
}: RemoteImageProps) => {
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  // Extract URL from Image object or use string directly
  const imageUrl =
    typeof src === 'string' ? src : src && typeof src === 'object' && 'url' in src ? src.url : ''

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
          src={imageUrl}
          alt={alt}
          loading={loading}
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

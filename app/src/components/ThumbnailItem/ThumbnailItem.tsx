import React, { useMemo, useCallback, useState } from 'react'
import { ThumbnailItemProps } from './types'
import styles from './ThumbnailItem.module.scss'

export const ThumbnailItem = (props: ThumbnailItemProps) => {
  const { src, isActive, onClick } = props
  const [isLoading, setIsLoading] = useState(true)

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const handleImageLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    setIsLoading(false)
  }, [])

  const containerClasses = useMemo(
    () =>
      [
        styles.thumbnailItem,
        isActive ? styles.thumbnailItemActive : '',
        isLoading ? styles.loading : '',
      ]
        .filter(Boolean)
        .join(' '),
    [isActive, isLoading],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      <img
        src={src}
        alt="Thumbnail image"
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  )
}

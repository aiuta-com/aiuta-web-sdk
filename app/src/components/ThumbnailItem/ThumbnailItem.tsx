import React, { useMemo, useCallback } from 'react'
import { ThumbnailItemProps } from './types'
import styles from './ThumbnailItem.module.scss'

export const ThumbnailItem = (props: ThumbnailItemProps) => {
  const { src, isActive, onClick } = props

  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  const containerClasses = useMemo(
    () =>
      [styles.thumbnailItem, isActive ? styles.thumbnailItemActive : ''].filter(Boolean).join(' '),
    [isActive],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      <img src={src} width={54} height={96} alt="Thumbnail image" />
    </div>
  )
}

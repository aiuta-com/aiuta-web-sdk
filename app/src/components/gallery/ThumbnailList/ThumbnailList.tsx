import React, { useMemo, useCallback, useState } from 'react'
import { ThumbnailListProps, ThumbnailData } from './types'
import styles from './ThumbnailList.module.scss'

// Internal ThumbnailItem component
interface ThumbnailItemProps {
  item: ThumbnailData
  isActive: boolean
  onClick: () => void
  variant: 'default' | 'fullscreen'
}

const ThumbnailItem = ({ item, isActive, onClick, variant }: ThumbnailItemProps) => {
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
        variant === 'fullscreen' ? styles.thumbnailItem_fullscreen : '',
        isActive ? styles.thumbnailItemActive : '',
        isLoading ? styles.loading : '',
      ]
        .filter(Boolean)
        .join(' '),
    [isActive, isLoading, variant],
  )

  return (
    <div className={containerClasses} onClick={handleClick}>
      <img
        src={item.url}
        alt="Thumbnail image"
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  )
}

// Main ThumbnailList component
export const ThumbnailList = ({
  items,
  activeId,
  onItemClick,
  variant = 'default',
  direction = 'horizontal',
  className,
  showSingleItem = false,
}: ThumbnailListProps) => {
  // Don't render if only one item and showSingleItem is false
  if (items.length <= 1 && !showSingleItem) {
    return null
  }

  const listClasses = useMemo(
    () =>
      [
        styles.thumbnailList,
        direction === 'vertical' ? styles.thumbnailList_vertical : styles.thumbnailList_horizontal,
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [direction, className],
  )

  return (
    <div className={listClasses}>
      {items.map((item, index) => (
        <ThumbnailItem
          key={item.id}
          item={item}
          isActive={item.id === activeId}
          onClick={() => onItemClick(item, index)}
          variant={variant}
        />
      ))}
    </div>
  )
}

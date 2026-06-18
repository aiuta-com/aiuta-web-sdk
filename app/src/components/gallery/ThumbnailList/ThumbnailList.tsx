import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { ThumbnailListProps, ThumbnailData } from './types'
import styles from './ThumbnailList.module.scss'

// Internal ThumbnailItem component
interface ThumbnailItemProps {
  item: ThumbnailData
  isActive: boolean
  onClick: () => void
  variant: 'default' | 'fullscreen'
  itemRef?: React.Ref<HTMLDivElement>
}

const ThumbnailItem = ({ item, isActive, onClick, variant, itemRef }: ThumbnailItemProps) => {
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
    <div ref={itemRef} className={containerClasses} onClick={handleClick}>
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
  const containerRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLDivElement>(null)
  // Edge-fade heights, scaled by how far the strip is scrolled past each extreme
  // (0 right at the edge → up to MAX_FADE), so they grow/shrink with the scroll.
  const [fade, setFade] = useState({ top: 0, bottom: 0 })

  const updateFade = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const MAX_FADE = 42
    const top = Math.max(0, Math.min(MAX_FADE, el.scrollTop))
    const bottom = Math.max(0, Math.min(MAX_FADE, el.scrollHeight - el.clientHeight - el.scrollTop))
    setFade((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }))
  }, [])

  // Bring the active thumbnail into view only when it's outside the visible
  // area (scroll the minimum needed, not to the center). A fade-height margin
  // keeps it clear of the top/bottom edge fades.
  useEffect(() => {
    const el = activeItemRef.current
    const container = el?.parentElement
    if (!el || !container) return
    const margin = 42
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight
    if (top < viewTop + margin) {
      container.scrollTo({ top: top - margin, behavior: 'smooth' })
    } else if (bottom > viewBottom - margin) {
      container.scrollTo({ top: bottom - container.clientHeight + margin, behavior: 'smooth' })
    }
  }, [activeId])

  // Recompute the fades when the items or the container size change.
  useEffect(() => {
    updateFade()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(updateFade)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items, updateFade])

  // Feed the scroll-scaled fade heights to the mask (vertical only).
  const fadeStyle = useMemo(() => {
    if (direction !== 'vertical') return undefined
    return {
      '--aiuta-thumb-fade-top': `${fade.top}px`,
      '--aiuta-thumb-fade-bottom': `${fade.bottom}px`,
    } as React.CSSProperties
  }, [direction, fade])

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

  // Don't render if only one item and showSingleItem is false
  if (items.length <= 1 && !showSingleItem) {
    return null
  }

  return (
    <div ref={containerRef} className={listClasses} onScroll={updateFade} style={fadeStyle}>
      {items.map((item, index) => (
        <ThumbnailItem
          key={item.id}
          item={item}
          isActive={item.id === activeId}
          itemRef={item.id === activeId ? activeItemRef : undefined}
          onClick={() => onItemClick(item, index)}
          variant={variant}
        />
      ))}
    </div>
  )
}

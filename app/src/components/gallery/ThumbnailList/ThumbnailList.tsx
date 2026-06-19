import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { ThumbnailListProps, ThumbnailData } from './types'
import styles from './ThumbnailList.module.scss'

// Distance from the strip's top/bottom edge that bounds the active thumbnail:
// where the keyboard/click auto-scroll parks it, and where scrolling past it
// hands the selection to the next/previous thumbnail. Matches the fade height.
const FOLLOW_MARGIN = 42

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
  // The next active change came from scrolling → don't auto-scroll it into view.
  const scrollDrivenRef = useRef(false)
  // A programmatic (into-view) scroll is in flight → don't let it drive the
  // selection (avoids a scroll↔select feedback loop).
  const programmaticRef = useRef(false)
  const programmaticTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Wheel delta accumulated past a scroll extreme, to keep "scrolling" the
  // selection at the same pace once the strip itself can't move further.
  const overscrollRef = useRef(0)

  const updateFade = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const top = Math.max(0, Math.min(FOLLOW_MARGIN, el.scrollTop))
    const bottom = Math.max(
      0,
      Math.min(FOLLOW_MARGIN, el.scrollHeight - el.clientHeight - el.scrollTop),
    )
    setFade((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }))
  }, [])

  // Bring the active thumbnail into view only when it's outside the visible area
  // (scroll the minimum needed, not to the center) — for click / keyboard /
  // delete. Skipped when the selection change itself came from scrolling.
  useEffect(() => {
    if (scrollDrivenRef.current) {
      scrollDrivenRef.current = false
      return
    }
    const el = activeItemRef.current
    const container = el?.parentElement
    if (!el || !container || direction !== 'vertical') return
    const top = el.offsetTop
    const bottom = top + el.offsetHeight
    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight
    let target: number | null = null
    if (top < viewTop + FOLLOW_MARGIN) target = top - FOLLOW_MARGIN
    else if (bottom > viewBottom - FOLLOW_MARGIN)
      target = bottom - container.clientHeight + FOLLOW_MARGIN
    if (target === null) return
    // Mark this scroll as programmatic so it doesn't trip the follow logic.
    programmaticRef.current = true
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
    programmaticTimer.current = setTimeout(() => {
      programmaticRef.current = false
    }, 400)
    container.scrollTo({ top: target, behavior: 'smooth' })
  }, [activeId, direction])

  useEffect(() => () => {
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
  }, [])

  // While the user scrolls the strip, hand the selection to the next/previous
  // thumbnail once the active one is scrolled past the FOLLOW_MARGIN bound.
  const handleScroll = useCallback(() => {
    updateFade()
    if (programmaticRef.current || direction !== 'vertical') return
    const el = containerRef.current
    const active = activeItemRef.current
    if (!el || !active) return
    const aTop = active.offsetTop
    const aBottom = aTop + active.offsetHeight
    const viewTop = el.scrollTop
    const viewBottom = viewTop + el.clientHeight
    const idx = items.findIndex((item) => item.id === activeId)
    if (idx === -1) return
    if (aTop < viewTop + FOLLOW_MARGIN && idx < items.length - 1) {
      // Scrolled down past the active → advance to the next one
      scrollDrivenRef.current = true
      onItemClick(items[idx + 1], idx + 1)
    } else if (aBottom > viewBottom - FOLLOW_MARGIN && idx > 0) {
      // Scrolled up past the active → go back to the previous one
      scrollDrivenRef.current = true
      onItemClick(items[idx - 1], idx - 1)
    }
  }, [updateFade, direction, items, activeId, onItemClick])

  // Once the strip can't scroll further in the wheel direction, keep stepping
  // the selection at the same pace ("virtual scroll") — one thumbnail per ~its
  // own height of accumulated delta. Non-passive so we can preventDefault at the
  // edge; while the strip can still scroll, we leave the native scroll alone.
  useEffect(() => {
    const el = containerRef.current
    if (!el || direction !== 'vertical') return
    const STEP = 88 // thumbnail height (80) + gap (8): matches the scroll pace
    const onWheel = (e: WheelEvent) => {
      let delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (delta === 0) return
      const dir = delta > 0 ? 1 : -1
      const canScrollMore =
        dir > 0
          ? el.scrollTop + el.clientHeight < el.scrollHeight - 1
          : el.scrollTop > 1
      if (canScrollMore) {
        overscrollRef.current = 0
        return
      }
      if (!e.cancelable) return
      e.preventDefault()
      // Normalize line/page wheel modes to pixels
      if (e.deltaMode === 1) delta *= 16
      else if (e.deltaMode === 2) delta *= el.clientHeight
      // Reset the accumulator when the direction flips
      if (overscrollRef.current !== 0 && Math.sign(overscrollRef.current) !== dir) {
        overscrollRef.current = 0
      }
      overscrollRef.current += delta
      const idx0 = items.findIndex((item) => item.id === activeId)
      if (idx0 === -1) return
      let idx = idx0
      while (Math.abs(overscrollRef.current) >= STEP) {
        overscrollRef.current -= dir * STEP
        const next = idx + dir
        if (next < 0 || next >= items.length) {
          overscrollRef.current = 0
          break
        }
        idx = next
      }
      if (idx !== idx0) {
        scrollDrivenRef.current = true
        onItemClick(items[idx], idx)
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [direction, items, activeId, onItemClick])

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
    <div ref={containerRef} className={listClasses} onScroll={handleScroll} style={fadeStyle}>
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

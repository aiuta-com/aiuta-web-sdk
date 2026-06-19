import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { ThumbnailListProps, ThumbnailData } from './types'
import styles from './ThumbnailList.module.scss'

// Distance from the strip's top/bottom edge that bounds the active thumbnail:
// where the keyboard/click auto-scroll parks it, and where scrolling past it
// hands the selection to the next/previous thumbnail. Matches the fade height.
const FOLLOW_MARGIN = 42

// Once the strip is at a scroll extreme, one selection step per this much
// accumulated wheel delta (thumbnail height 80 + gap 8).
const STEP = 88

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
  wheelApiRef,
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
  // The "active zone": the active thumbnail's on-screen position (its center,
  // measured from the strip's top edge) captured when the selection is set by a
  // click/keyboard/open. Scrolling then hands the selection to whichever
  // thumbnail moves into this fixed on-screen spot, so the active stays roughly
  // where the previous one was.
  const anchorRef = useRef<number | null>(null)

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

  // Bring the active thumbnail into comfortable view (clear of the edge fades)
  // if it's clipped or under an edge, then capture the active zone at its
  // resulting on-screen position. A comfortably-visible item is left in place,
  // so its current spot becomes the zone. Used on click/keyboard/open and on
  // resize, so the active is never left half outside the strip.
  const anchorActive = useCallback(
    (animate: boolean) => {
      const el = activeItemRef.current
      const container = containerRef.current
      if (!el || !container || direction !== 'vertical') return
      const top = el.offsetTop
      const bottom = top + el.offsetHeight
      const viewTop = container.scrollTop
      const viewBottom = viewTop + container.clientHeight
      let target = viewTop
      if (top < viewTop + FOLLOW_MARGIN) target = top - FOLLOW_MARGIN
      else if (bottom > viewBottom - FOLLOW_MARGIN)
        target = bottom - container.clientHeight + FOLLOW_MARGIN
      const max = container.scrollHeight - container.clientHeight
      target = Math.max(0, Math.min(max, target))
      // Zone = the active's center relative to its (post-scroll) viewport top.
      anchorRef.current = top + el.offsetHeight / 2 - target
      if (Math.abs(target - viewTop) < 1) return
      // Mark this scroll as programmatic so it doesn't trip the follow logic.
      programmaticRef.current = true
      if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
      programmaticTimer.current = setTimeout(() => {
        programmaticRef.current = false
      }, 400)
      container.scrollTo({ top: target, behavior: animate ? 'smooth' : 'auto' })
    },
    [direction],
  )

  // On a click/keyboard/open selection change, reveal + anchor the active.
  // Skipped when the change came from scrolling (the zone stays fixed there).
  useEffect(() => {
    if (scrollDrivenRef.current) {
      scrollDrivenRef.current = false
      return
    }
    anchorActive(true)
  }, [activeId, anchorActive])

  useEffect(() => () => {
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
  }, [])

  // While the user scrolls the strip, the active is whichever thumbnail moves
  // into the active zone (the fixed on-screen spot captured when the selection
  // was last set by click/keyboard/open). The strip moves and the selection
  // changes together, and the active stays roughly where the previous one was.
  const handleScroll = useCallback(() => {
    updateFade()
    if (programmaticRef.current || direction !== 'vertical') return
    const el = containerRef.current
    if (!el || anchorRef.current === null) return
    // The active zone in content space: scroll offset + its on-screen position.
    const viewTop = el.scrollTop
    const viewBottom = viewTop + el.clientHeight
    const zoneY = viewTop + anchorRef.current
    const thumbs = el.querySelectorAll<HTMLElement>(`.${styles.thumbnailItem}`)
    if (!thumbs.length) return
    // Prefer the thumbnail nearest the zone among those fully in view, so the
    // active never ends up half-clipped at a scroll edge; fall back to the
    // nearest overall if none is fully visible.
    let bestIdx = -1
    let bestDist = Infinity
    let bestVisibleIdx = -1
    let bestVisibleDist = Infinity
    thumbs.forEach((thumb, i) => {
      const top = thumb.offsetTop
      const bottom = top + thumb.offsetHeight
      const dist = Math.abs((top + bottom) / 2 - zoneY)
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = i
      }
      const fullyVisible = top >= viewTop - 0.5 && bottom <= viewBottom + 0.5
      if (fullyVisible && dist < bestVisibleDist) {
        bestVisibleDist = dist
        bestVisibleIdx = i
      }
    })
    const chosen = bestVisibleIdx >= 0 ? bestVisibleIdx : bestIdx
    if (chosen >= 0 && items[chosen] && items[chosen].id !== activeId) {
      scrollDrivenRef.current = true
      onItemClick(items[chosen], chosen)
    }
  }, [updateFade, direction, items, activeId, onItemClick])

  // Shared wheel handling. In range it moves the selection by scrolling (zone
  // selection runs via onScroll); at a scroll extreme it keeps stepping the
  // selection at the same pace ("virtual scroll"). `active` actively scrolls the
  // strip for the in-range case — used when the wheel is forwarded from outside
  // the strip (the central image / backdrop); a wheel directly on the strip
  // leaves that to native scrolling. Returns true if the edge step ran (the
  // caller should preventDefault).
  const consumeWheel = useCallback(
    (deltaY: number, deltaX: number, deltaMode: number, active: boolean) => {
      const el = containerRef.current
      if (!el || direction !== 'vertical') return false
      let delta = Math.abs(deltaY) >= Math.abs(deltaX) ? deltaY : deltaX
      if (delta === 0) return false
      const dir = delta > 0 ? 1 : -1
      const canScrollMore =
        dir > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 1
      // Normalize line/page wheel modes to pixels
      if (deltaMode === 1) delta *= 16
      else if (deltaMode === 2) delta *= el.clientHeight
      if (canScrollMore) {
        overscrollRef.current = 0
        if (active) el.scrollTop += delta
        return false
      }
      // Reset the accumulator when the direction flips
      if (overscrollRef.current !== 0 && Math.sign(overscrollRef.current) !== dir) {
        overscrollRef.current = 0
      }
      overscrollRef.current += delta
      const idx0 = items.findIndex((item) => item.id === activeId)
      if (idx0 === -1) return true
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
        // Move the active zone onto the newly selected thumbnail so reversing
        // the scroll resumes from here instead of snapping back to the old zone.
        const thumbs = el.querySelectorAll<HTMLElement>(`.${styles.thumbnailItem}`)
        const thumb = thumbs[idx]
        if (thumb) anchorRef.current = thumb.offsetTop + thumb.offsetHeight / 2 - el.scrollTop
        onItemClick(items[idx], idx)
      }
      return true
    },
    [direction, items, activeId, onItemClick],
  )

  // Wheel directly on the strip: native scroll in range, virtual step at the
  // edge (non-passive so we can preventDefault there).
  useEffect(() => {
    const el = containerRef.current
    if (!el || direction !== 'vertical') return
    const onWheel = (e: WheelEvent) => {
      const steppedAtEdge = consumeWheel(e.deltaY, e.deltaX, e.deltaMode, false)
      if (steppedAtEdge && e.cancelable) e.preventDefault()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [direction, consumeWheel])

  // Expose wheel forwarding so the gallery can route central-area wheel/trackpad
  // gestures into the strip (over the backdrop and the un-zoomed image).
  useEffect(() => {
    if (!wheelApiRef) return
    const ref = wheelApiRef
    ref.current = {
      scrollByWheel: (deltaY: number, deltaX: number, deltaMode: number) =>
        consumeWheel(deltaY, deltaX, deltaMode, true),
    }
    return () => {
      ref.current = null
    }
  }, [wheelApiRef, consumeWheel])

  // Recompute the fades when the items or the container size change, and on
  // resize keep the active thumbnail in view and refresh the active zone.
  useEffect(() => {
    updateFade()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      updateFade()
      anchorActive(false)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [items, updateFade, anchorActive])

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

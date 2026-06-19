import React, { useCallback, useEffect, useRef } from 'react'
import { combineClassNames } from '@/utils'
import { ZoomableImage } from './ZoomableImage'
import styles from '../FullScreenGallery.module.scss'

interface GalleryImage {
  id: string
  url: string
}

interface GalleryPagerProps {
  images: GalleryImage[]
  activeId: string
  /** Called when scrolling brings a different cell into view. */
  onActiveChange: (id: string) => void
  /** Narrower left inset when the thumbnail strip isn't shown. */
  hasThumbnails: boolean
  onClose: () => void
}

/**
 * Vertical paged scroller for the desktop fullscreen gallery: every image is a
 * full-height cell (scroll-snap paging), each holding a zoomable image inset
 * 16px top/bottom. Scrolling drives the active selection; an external selection
 * change (thumbnail click / keyboard) jumps the scroll to that cell with no
 * animation.
 */
export const GalleryPager = ({
  images,
  activeId,
  onActiveChange,
  hasThumbnails,
  onClose,
}: GalleryPagerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  // A programmatic jump is in flight → don't let its scroll events drive the
  // selection (avoids a scroll↔select feedback loop).
  const programmaticRef = useRef(false)
  const programmaticTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // The last selection change came from scrolling → don't jump the scroll back.
  const scrollDrivenRef = useRef(false)

  // Jump the scroll to the active cell when the selection changes from outside
  // (thumbnail click / keyboard / open / delete) — instantly, no animation.
  useEffect(() => {
    if (scrollDrivenRef.current) {
      scrollDrivenRef.current = false
      return
    }
    const el = ref.current
    if (!el) return
    const idx = images.findIndex((image) => image.id === activeId)
    if (idx < 0) return
    const target = idx * el.clientHeight
    if (Math.abs(el.scrollTop - target) < 1) return
    programmaticRef.current = true
    if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
    programmaticTimer.current = setTimeout(() => {
      programmaticRef.current = false
    }, 200)
    el.scrollTo({ top: target, behavior: 'auto' })
  }, [activeId, images])

  useEffect(
    () => () => {
      if (programmaticTimer.current) clearTimeout(programmaticTimer.current)
    },
    [],
  )

  // While the user scrolls, the cell nearest the viewport becomes active.
  const handleScroll = useCallback(() => {
    const el = ref.current
    if (!el || programmaticRef.current) return
    const idx = Math.round(el.scrollTop / el.clientHeight)
    const image = images[idx]
    if (image && image.id !== activeId) {
      scrollDrivenRef.current = true
      onActiveChange(image.id)
    }
  }, [images, activeId, onActiveChange])

  return (
    <div
      ref={ref}
      className={combineClassNames(styles.pager, !hasThumbnails && styles.pager_noThumbnails)}
      onScroll={handleScroll}
    >
      {images.map((image) => (
        <div key={image.id} className={styles.pagerCell}>
          <ZoomableImage
            src={image.url}
            alt="Full Screen Image"
            tapToClose={false}
            onClose={onClose}
            allowPageScroll
          />
        </div>
      ))}
    </div>
  )
}

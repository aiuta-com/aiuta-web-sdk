import React, { useRef, TouchEvent, useCallback } from 'react'
import type { BottomSheetProps } from './types'
import styles from './BottomSheet.module.scss'

const SWIPE_DOWN_THRESHOLD = 200

export const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const initialOffsetTopRef = useRef<number | null>(null)

  const handleTouchStart = useCallback(() => {
    if (contentRef.current && !initialOffsetTopRef.current) {
      initialOffsetTopRef.current = contentRef.current.offsetTop
    }
  }, [])

  const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const { clientY } = event.changedTouches[0]

    if (contentRef.current && initialOffsetTopRef.current) {
      const deltaY = clientY - initialOffsetTopRef.current

      if (deltaY > 0) {
        contentRef.current.style.transform = `translateY(${deltaY}px)`
      }
    }
  }, [])

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const { clientY } = event.changedTouches[0]

      if (contentRef.current && initialOffsetTopRef.current) {
        const deltaY = clientY - initialOffsetTopRef.current

        if (deltaY >= SWIPE_DOWN_THRESHOLD) {
          onClose()
        }

        // Reset transform
        contentRef.current.style.transform = ''
        initialOffsetTopRef.current = null
      }
    },
    [onClose],
  )

  const handleOverlayClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <div
      className={`${styles.bottomSheet} ${isOpen ? styles.bottomSheetActive : ''}`}
      onClick={handleOverlayClick}
    >
      <div ref={contentRef} className={styles.content} onClick={handleContentClick}>
        <div
          className={styles.grabber}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.handle} />
        </div>

        {children}
      </div>
    </div>
  )
}

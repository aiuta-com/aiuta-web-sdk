import React, { useRef, TouchEvent, MouseEvent, useCallback } from 'react'
import { combineClassNames } from '@/utils'
import type { BottomSheetProps } from './types'
import styles from './BottomSheet.module.scss'

const SWIPE_DOWN_THRESHOLD = 100

export const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const initialMouseYRef = useRef<number | null>(null)
  const lastPositionsRef = useRef<number[]>([])
  const isDraggingRef = useRef<boolean>(false)

  // Helper to get clientY from touch or mouse event
  const getClientY = useCallback(
    (event: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
      if ('touches' in event) {
        return event.changedTouches[0].clientY
      }
      return event.clientY
    },
    [],
  )

  // Common move logic for both touch and mouse
  const handleDragMove = useCallback((clientY: number) => {
    if (contentRef.current && initialMouseYRef.current !== null && isDraggingRef.current) {
      const deltaY = clientY - initialMouseYRef.current

      // Store last few positions for velocity calculation (keep last 3)
      lastPositionsRef.current.push(clientY)
      if (lastPositionsRef.current.length > 3) {
        lastPositionsRef.current.shift()
      }

      // Only allow dragging down (positive deltaY)
      if (deltaY > 0) {
        contentRef.current.style.transform = `translateY(${deltaY}px)`
      }
    }
  }, [])

  // Common end logic for both touch and mouse
  const handleDragEnd = useCallback(
    (clientY: number) => {
      if (contentRef.current && initialMouseYRef.current !== null && isDraggingRef.current) {
        const deltaY = clientY - initialMouseYRef.current

        // Calculate velocity based on last few positions
        let velocity = 0
        const positions = lastPositionsRef.current
        if (positions.length >= 2) {
          // Take velocity from last two positions
          velocity = positions[positions.length - 1] - positions[positions.length - 2]
        }

        const shouldClose = deltaY >= SWIPE_DOWN_THRESHOLD && velocity >= 0

        if (shouldClose) {
          onClose()
        }

        contentRef.current.style.transform = ''
        initialMouseYRef.current = null
        lastPositionsRef.current = []
        isDraggingRef.current = false
      }
    },
    [onClose],
  )

  // Common start logic for both touch and mouse
  const handleDragStart = useCallback((clientY: number) => {
    if (contentRef.current && initialMouseYRef.current === null) {
      initialMouseYRef.current = clientY
      lastPositionsRef.current = [clientY]
      isDraggingRef.current = true
    }
  }, [])

  // Global mouse handlers
  const handleGlobalMouseMove = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!isDraggingRef.current) return
      handleDragMove(event.clientY)
    },
    [handleDragMove],
  )

  const handleGlobalMouseUp = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!isDraggingRef.current) return

      handleDragEnd(event.clientY)

      // Clean up global listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    },
    [handleDragEnd, handleGlobalMouseMove],
  )

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.preventDefault() // Prevent parent page scrolling
      const clientY = getClientY(event)
      handleDragStart(clientY)
    },
    [handleDragStart, getClientY],
  )

  const handleTouchMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.preventDefault() // Prevent parent page scrolling
      const clientY = getClientY(event)
      handleDragMove(clientY)
    },
    [getClientY, handleDragMove],
  )

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      event.preventDefault() // Prevent parent page scrolling
      const clientY = getClientY(event)
      handleDragEnd(clientY)
    },
    [getClientY, handleDragEnd],
  )

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault() // Prevent text selection
      const clientY = getClientY(event)
      handleDragStart(clientY)

      // Add global mouse listeners - they handle all subsequent mouse events
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
      document.addEventListener('mouseup', handleGlobalMouseUp, { once: true })
    },
    [handleDragStart, getClientY, handleGlobalMouseMove, handleGlobalMouseUp],
  )

  const handleOverlayClick = useCallback(() => {
    onClose()
  }, [onClose])

  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <div
      className={combineClassNames(styles.bottomSheet, isOpen && styles.bottomSheet_active)}
      onClick={handleOverlayClick}
    >
      <div ref={contentRef} className={styles.content} onClick={handleContentClick}>
        <div
          className={styles.grabber}
          data-scrollable="true"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className={styles.handle} />
        </div>

        {children}
      </div>
    </div>
  )
}

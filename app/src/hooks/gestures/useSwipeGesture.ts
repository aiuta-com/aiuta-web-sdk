import { useRef, useCallback, useEffect } from 'react'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface SwipeEvent {
  direction: SwipeDirection
  deltaX: number
  deltaY: number
  distance: number
}

export interface SwipeGestureConfig {
  /** Minimum distance for a swipe to be recognized (in pixels) */
  delta?: number
  /** Maximum time for a swipe gesture (in milliseconds) */
  maxDuration?: number
}

export interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  ref: React.RefCallback<HTMLElement>
}

export const useSwipeGesture = (
  onSwipe: (event: SwipeEvent) => void,
  config: SwipeGestureConfig = {},
): SwipeHandlers => {
  const { delta = 30, maxDuration = 500 } = config

  const touchStartRef = useRef<{
    x: number
    y: number
    time: number
  } | null>(null)

  // For trackpad/wheel events debouncing
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    }
    // Don't prevent default here - let touches work normally initially
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    // Check if this looks like a swipe gesture
    const touch = e.touches[0]
    const deltaX = Math.abs(touchStartRef.current.x - touch.clientX)
    const deltaY = Math.abs(touchStartRef.current.y - touch.clientY)

    // Only prevent default if significant movement (potential swipe)
    if (deltaX > 10 || deltaY > 10) {
      e.preventDefault()
    }
  }, [])

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const endTime = Date.now()
      const duration = endTime - touchStartRef.current.time

      // Check if gesture was too slow
      if (duration > maxDuration) {
        touchStartRef.current = null
        return
      }

      const deltaX = touchStartRef.current.x - touch.clientX
      const deltaY = touchStartRef.current.y - touch.clientY
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

      // Check if gesture was too short (this is just a tap)
      if (distance < delta) {
        touchStartRef.current = null
        return
      }

      // Only prevent default if this was actually a swipe
      e.preventDefault()

      // Determine direction based on which axis has more movement
      let direction: SwipeDirection
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'left' : 'right'
      } else {
        direction = deltaY > 0 ? 'up' : 'down'
      }

      const swipeEvent: SwipeEvent = {
        direction,
        deltaX,
        deltaY,
        distance,
      }

      onSwipe(swipeEvent)
      touchStartRef.current = null
    },
    [onSwipe, delta, maxDuration],
  )

  // Native wheel handler with passive: false
  const nativeWheelHandler = useCallback(
    (e: WheelEvent) => {
      // Always prevent default to stop browser navigation
      e.preventDefault()

      // Check if there's significant movement
      const minDelta = 10
      if (Math.abs(e.deltaX) < minDelta && Math.abs(e.deltaY) < minDelta) return

      // Debounce
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }

      wheelTimeoutRef.current = setTimeout(() => {
        let direction: SwipeDirection

        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          direction = e.deltaX > 0 ? 'left' : 'right'
        } else {
          direction = e.deltaY > 0 ? 'up' : 'down'
        }

        const swipeEvent: SwipeEvent = {
          direction,
          deltaX: e.deltaX,
          deltaY: e.deltaY,
          distance: Math.sqrt(e.deltaX * e.deltaX + e.deltaY * e.deltaY),
        }

        onSwipe(swipeEvent)
      }, 50)
    },
    [onSwipe],
  )

  // Ref callback to setup native listeners
  const ref = useCallback(
    (element: HTMLElement | null) => {
      // Cleanup previous element
      if (elementRef.current) {
        elementRef.current.removeEventListener('wheel', nativeWheelHandler)
      }

      // Setup new element
      if (element) {
        elementRef.current = element
        element.addEventListener('wheel', nativeWheelHandler, { passive: false })
      } else {
        elementRef.current = null
      }
    },
    [nativeWheelHandler],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('wheel', nativeWheelHandler)
      }
    }
  }, [nativeWheelHandler])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ref,
  }
}

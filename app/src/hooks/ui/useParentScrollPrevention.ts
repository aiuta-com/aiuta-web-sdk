import { useEffect } from 'react'

/**
 * Custom hook to prevent parent page scroll when app is visible
 * Allows app interactions but blocks scroll gestures that could affect parent page
 */
export const useParentScrollPrevention = (isEnabled: boolean) => {
  useEffect(() => {
    if (!isEnabled) return

    const preventParentScroll = (e: TouchEvent) => {
      const target = e.target as Element

      // Allow touches on interactive elements inside our app
      if (target.closest('button, input, select, textarea, [role="button"], [tabindex]')) {
        return // Let interactive elements work normally
      }

      // Allow touches on scrollable content inside our app
      if (target.closest('[data-scrollable], .overflow-auto, .overflow-scroll')) {
        return // Let internal scrolling work
      }

      // Block scroll gestures but allow taps
      if (e.type === 'touchmove') {
        // Only block if this looks like a scroll gesture
        if (e.touches.length === 1) {
          e.preventDefault() // Block single-finger scroll
          e.stopPropagation()
        }
      }
    }

    // Only block touchmove to prevent scrolling, but allow touchstart/touchend for interactions
    document.addEventListener('touchmove', preventParentScroll, {
      passive: false,
      capture: true,
    })

    return () => {
      document.removeEventListener('touchmove', preventParentScroll, true)
    }
  }, [isEnabled])
}

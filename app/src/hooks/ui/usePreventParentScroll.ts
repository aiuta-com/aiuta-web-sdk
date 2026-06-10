import { useEffect } from 'react'

/**
 * Stops touch-scroll gestures inside the iframe from chaining to the host page.
 *
 * iOS Safari routes a touch drag over the iframe to the parent document when the
 * app has nothing to scroll, and neither `overscroll-behavior` nor `touch-action`
 * reliably prevents this across the frame boundary. So we do it in JS: a
 * single-finger drag keeps its native scroll only when it lands on an element
 * that can actually scroll in that direction; otherwise `preventDefault()` stops
 * the gesture before it can pan the parent. Multi-touch (pinch) and the app's own
 * swipe handlers are left untouched (we never stop propagation).
 */
export const usePreventParentScroll = (isEnabled: boolean) => {
  useEffect(() => {
    if (!isEnabled) return

    let startX = 0
    let startY = 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const canScrollInDirection = (target: EventTarget | null, dx: number, dy: number): boolean => {
      const horizontal = Math.abs(dx) > Math.abs(dy)
      let node = target instanceof Element ? target : null

      while (node && node !== document.documentElement) {
        const style = getComputedStyle(node)

        if (horizontal) {
          const overflowX = style.overflowX
          if (
            (overflowX === 'auto' || overflowX === 'scroll') &&
            node.scrollWidth > node.clientWidth
          ) {
            const atLeft = node.scrollLeft <= 0
            const atRight = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1
            if (dx > 0 && !atLeft) return true
            if (dx < 0 && !atRight) return true
          }
        } else {
          const overflowY = style.overflowY
          if (
            (overflowY === 'auto' || overflowY === 'scroll') &&
            node.scrollHeight > node.clientHeight
          ) {
            const atTop = node.scrollTop <= 0
            const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1
            if (dy > 0 && !atTop) return true
            if (dy < 0 && !atBottom) return true
          }
        }

        node = node.parentElement
      }

      return false
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1 || !e.cancelable) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (!canScrollInDirection(e.target, dx, dy)) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })

    return () => {
      document.removeEventListener('touchstart', onTouchStart, true)
      document.removeEventListener('touchmove', onTouchMove, true)
    }
  }, [isEnabled])
}

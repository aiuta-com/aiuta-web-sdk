import type { PointerEvent } from 'react'

/**
 * Material-style click ripple (mirrors the original demo's Quasar v-ripple).
 * Attach to `onPointerDown` of a `position: relative; overflow: hidden` element.
 */
export const createRipple = (event: PointerEvent<HTMLElement>) => {
  const host = event.currentTarget
  const rect = host.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)

  const ripple = document.createElement('span')
  ripple.className = 'ripple'
  ripple.style.width = `${size}px`
  ripple.style.height = `${size}px`
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`
  ripple.addEventListener('animationend', () => ripple.remove())

  host.appendChild(ripple)
}

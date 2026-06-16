import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ZoomableImage.module.scss'

// Max magnification relative to the fit-to-screen scale.
const MAX_ZOOM = 4
// A touch that moves less than this (local px) and lifts quickly is a tap.
const TAP_MOVE_TOL = 10
const TAP_MAX_MS = 300
// Double-tap: a second tap within this window and distance toggles the zoom
// instead of closing. The single-tap close is deferred by the same window so
// the first tap of a double-tap doesn't dismiss the viewer.
const DOUBLE_TAP_MS = 280
const DOUBLE_TAP_DIST = 30
const DOUBLE_TAP_ZOOM = 2.5

interface ZoomableImageProps {
  src: string
  alt?: string
  /** Called on a clean tap (no pan/pinch) — used to dismiss the viewer. */
  onClose: () => void
}

interface Transform {
  /** Absolute scale: displayed px per natural px. */
  s: number
  /** Top-left of the image inside the container, in local px. */
  tx: number
  ty: number
}

/**
 * Pinch-to-zoom + pan image viewer for the mobile fullscreen result.
 *
 * The transform model mirrors the qa-tool ZoomCanvas (anchor the point under
 * the gesture focus, clamp so image edges never leave the viewport), but the
 * input here is touch: two fingers zoom around their midpoint, one finger pans
 * once zoomed in, and a clean tap closes. Coordinates are converted into the
 * container's *local* space so the math stays correct under the scaled shell
 * (transform: scale(--aiuta-zoom)) used on very small screens.
 */
export const ZoomableImage = ({ src, alt = 'Full screen image', onClose }: ZoomableImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const natRef = useRef<{ w: number; h: number } | null>(null)
  const tfRef = useRef<Transform>({ s: 1, tx: 0, ty: 0 })
  const [tf, setTf] = useState<Transform>(tfRef.current)
  const [ready, setReady] = useState(false)
  // Smooth the transform only for double-tap zoom (never during a live gesture).
  const [animate, setAnimate] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPendingClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const apply = useCallback((next: Transform) => {
    tfRef.current = next
    setTf(next)
  }, [])

  // Container size in local (pre-shell-scale) px plus the shell's scale factor,
  // so pointer coordinates (viewport px) can be mapped into local px.
  const metrics = useCallback(() => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const cw = el.offsetWidth
    const ch = el.offsetHeight
    const scaleFactor = cw > 0 ? rect.width / cw : 1
    return { cw, ch, left: rect.left, top: rect.top, scaleFactor }
  }, [])

  const fitScale = useCallback((cw: number, ch: number) => {
    const nat = natRef.current
    if (!nat) return 1
    return Math.min(cw / nat.w, ch / nat.h)
  }, [])

  // Keep the image covering the viewport: when an axis is smaller than the
  // container it stays centered, otherwise its edges can't travel inside.
  const clamp = useCallback(
    (t: Transform): Transform => {
      const m = metrics()
      const nat = natRef.current
      if (!m || !nat) return t
      const dispW = nat.w * t.s
      const dispH = nat.h * t.s
      let tx = t.tx
      let ty = t.ty
      if (dispW <= m.cw) tx = (m.cw - dispW) / 2
      else tx = Math.min(0, Math.max(m.cw - dispW, tx))
      if (dispH <= m.ch) ty = (m.ch - dispH) / 2
      else ty = Math.min(0, Math.max(m.ch - dispH, ty))
      return { s: t.s, tx, ty }
    },
    [metrics],
  )

  const reset = useCallback(() => {
    const m = metrics()
    const nat = natRef.current
    if (!m || !nat) return
    const fit = fitScale(m.cw, m.ch)
    apply({ s: fit, tx: (m.cw - nat.w * fit) / 2, ty: (m.ch - nat.h * fit) / 2 })
  }, [metrics, fitScale, apply])

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    natRef.current = { w: img.naturalWidth, h: img.naturalHeight }
    setReady(true)
    reset()
  }

  // Re-fit on container resize (orientation change, shell zoom step).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (natRef.current) reset()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [reset])

  // Touch gestures via native non-passive listeners so preventDefault works.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const g = {
      mode: 'none' as 'none' | 'pan' | 'pinch',
      startDist: 0,
      startS: 1,
      lastX: 0,
      lastY: 0,
      downX: 0,
      downY: 0,
      moved: false,
      downT: 0,
      lastTapT: 0,
      lastTapX: 0,
      lastTapY: 0,
    }

    const toLocal = (clientX: number, clientY: number) => {
      const m = metrics()
      if (!m) return { x: 0, y: 0 }
      return { x: (clientX - m.left) / m.scaleFactor, y: (clientY - m.top) / m.scaleFactor }
    }
    const distance = (a: Touch, b: Touch) => {
      const m = metrics()
      const f = m ? m.scaleFactor : 1
      return Math.hypot((a.clientX - b.clientX) / f, (a.clientY - b.clientY) / f)
    }
    const midpoint = (a: Touch, b: Touch) =>
      toLocal((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2)

    const onStart = (e: TouchEvent) => {
      if (!natRef.current) return
      // A new gesture cancels a pending single-tap close and any zoom animation.
      cancelPendingClose()
      setAnimate(false)
      if (e.touches.length === 1) {
        const p = toLocal(e.touches[0].clientX, e.touches[0].clientY)
        g.mode = 'pan'
        g.lastX = p.x
        g.lastY = p.y
        g.downX = p.x
        g.downY = p.y
        g.moved = false
        g.downT = e.timeStamp
      } else if (e.touches.length === 2) {
        g.mode = 'pinch'
        g.startDist = distance(e.touches[0], e.touches[1])
        g.startS = tfRef.current.s
      }
    }

    const onMove = (e: TouchEvent) => {
      const nat = natRef.current
      const m = metrics()
      if (!nat || !m) return

      if (g.mode === 'pinch' && e.touches.length >= 2 && g.startDist > 0) {
        e.preventDefault()
        const d = distance(e.touches[0], e.touches[1])
        const fit = fitScale(m.cw, m.ch)
        const newS = Math.max(fit, Math.min(fit * MAX_ZOOM, g.startS * (d / g.startDist)))
        const f = midpoint(e.touches[0], e.touches[1])
        const { s, tx, ty } = tfRef.current
        // Anchor: the image point under the focus stays under it after zooming.
        const imgX = (f.x - tx) / s
        const imgY = (f.y - ty) / s
        apply(clamp({ s: newS, tx: f.x - imgX * newS, ty: f.y - imgY * newS }))
      } else if (g.mode === 'pan' && e.touches.length === 1) {
        const p = toLocal(e.touches[0].clientX, e.touches[0].clientY)
        const dx = p.x - g.lastX
        const dy = p.y - g.lastY
        g.lastX = p.x
        g.lastY = p.y
        if (!g.moved && (Math.abs(p.x - g.downX) > TAP_MOVE_TOL || Math.abs(p.y - g.downY) > TAP_MOVE_TOL)) {
          g.moved = true
        }
        const { s, tx, ty } = tfRef.current
        const canPan = nat.w * s > m.cw + 0.5 || nat.h * s > m.ch + 0.5
        if (canPan) {
          e.preventDefault()
          apply(clamp({ s, tx: tx + dx, ty: ty + dy }))
        }
      }
    }

    const onEnd = (e: TouchEvent) => {
      // Lifting one finger of a pinch → continue panning with the other one,
      // without registering it as a tap.
      if (g.mode === 'pinch' && e.touches.length === 1) {
        const p = toLocal(e.touches[0].clientX, e.touches[0].clientY)
        g.mode = 'pan'
        g.lastX = p.x
        g.lastY = p.y
        g.moved = true
        return
      }
      if (g.mode === 'pan' && e.touches.length === 0) {
        const dt = e.timeStamp - g.downT
        if (!g.moved && dt < TAP_MAX_MS) {
          // Suppress the synthesized click so the container's onClick fallback
          // doesn't fire a second close.
          e.preventDefault()

          const isDoubleTap =
            e.timeStamp - g.lastTapT < DOUBLE_TAP_MS &&
            Math.abs(g.downX - g.lastTapX) < DOUBLE_TAP_DIST &&
            Math.abs(g.downY - g.lastTapY) < DOUBLE_TAP_DIST

          if (isDoubleTap) {
            // Second tap → toggle zoom, cancel the deferred close from the first.
            g.lastTapT = 0
            cancelPendingClose()
            const m = metrics()
            const nat = natRef.current
            if (m && nat) {
              const fit = fitScale(m.cw, m.ch)
              setAnimate(true)
              if (tfRef.current.s > fit * 1.05) {
                reset()
              } else {
                const newS = fit * DOUBLE_TAP_ZOOM
                const { s, tx, ty } = tfRef.current
                const imgX = (g.downX - tx) / s
                const imgY = (g.downY - ty) / s
                apply(clamp({ s: newS, tx: g.downX - imgX * newS, ty: g.downY - imgY * newS }))
              }
            }
          } else {
            // First (possibly only) tap: remember it and defer the close so a
            // second tap can still upgrade the gesture to a double-tap zoom.
            g.lastTapT = e.timeStamp
            g.lastTapX = g.downX
            g.lastTapY = g.downY
            cancelPendingClose()
            closeTimerRef.current = setTimeout(() => {
              closeTimerRef.current = null
              onClose()
            }, DOUBLE_TAP_MS)
          }
        }
      }
      if (e.touches.length === 0) g.mode = 'none'
    }

    el.addEventListener('touchstart', onStart, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: false })
    el.addEventListener('touchcancel', onEnd, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [metrics, fitScale, clamp, apply, reset, cancelPendingClose, onClose])

  // Clear any pending single-tap close on unmount.
  useEffect(() => () => cancelPendingClose(), [cancelPendingClose])

  const nat = natRef.current

  return (
    // onClick is the non-touch (desktop) fallback; on touch the tap path above
    // calls onClose and cancels the synthesized click.
    <div ref={containerRef} className={styles.container} onClick={() => onClose()}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={handleImgLoad}
        className={styles.image}
        style={
          ready && nat
            ? {
                position: 'absolute',
                top: 0,
                left: 0,
                width: nat.w,
                height: nat.h,
                maxWidth: 'none',
                maxHeight: 'none',
                transform: `translate3d(${tf.tx}px, ${tf.ty}px, 0) scale(${tf.s})`,
                transformOrigin: '0 0',
                willChange: 'transform',
                transition: animate ? 'transform 0.2s ease-out' : undefined,
              }
            : undefined
        }
      />
    </div>
  )
}

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader } from '@/components/ui/Loader'
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

/** Displayed image rectangle in the container's local coordinate space. */
export interface ImageBox {
  left: number
  top: number
  right: number
  bottom: number
  /** Bottom edge of the fitted (un-zoomed) image — stable across zoom. */
  fitBottom: number
  /** Container width, so a parent can clamp controls to stay on-screen. */
  containerW: number
}

interface ZoomableImageProps {
  src: string
  alt?: string
  /** Called on a clean tap (no pan/pinch) — used to dismiss the viewer. */
  onClose: () => void
  /**
   * Whether a clean tap/click dismisses the viewer. True for the mobile
   * fullscreen (tap to close); false for the desktop gallery, which closes via
   * the X button / backdrop and keeps taps for zoom only.
   */
  tapToClose?: boolean
  /**
   * Reports the displayed image rectangle (after fit/zoom/pan) so a parent can
   * anchor controls to the image's edge and follow it as it zooms. Null until
   * the image is measured.
   */
  onImageBox?: (box: ImageBox | null) => void
  /**
   * When the image sits in a scroll/pager, let a plain (non-pinch) wheel pass
   * through to the scroller while the image is at fit scale, so it can page.
   * Zoom is then reached via pinch (ctrl+wheel) or double-click; once zoomed in,
   * the wheel pans/zooms the image as usual.
   */
  allowPageScroll?: boolean
}

interface Transform {
  /** Absolute scale: displayed px per natural px. */
  s: number
  /** Top-left of the image inside the container, in local px. */
  tx: number
  ty: number
}

/**
 * Zoom + pan image viewer used by both fullscreen flows.
 *
 * The transform model mirrors the qa-tool ZoomCanvas (anchor the point under
 * the gesture focus, clamp so image edges never leave the viewport). Touch:
 * two fingers zoom around their midpoint, one finger pans, double-tap toggles
 * zoom, clean tap closes. Mouse (desktop): wheel zooms around the cursor, drag
 * pans, double-click toggles zoom. Coordinates are converted into the
 * container's *local* space so the math stays correct under the scaled shell
 * (transform: scale(--aiuta-zoom)) used on very small screens.
 */
export const ZoomableImage = ({
  src,
  alt = 'Full screen image',
  onClose,
  tapToClose = true,
  onImageBox,
  allowPageScroll = false,
}: ZoomableImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const natRef = useRef<{ w: number; h: number } | null>(null)
  const tfRef = useRef<Transform>({ s: 1, tx: 0, ty: 0 })
  const [tf, setTf] = useState<Transform>(tfRef.current)
  const [ready, setReady] = useState(false)
  // Delay the spinner so it doesn't flash for an already-cached image; a slow
  // load (spinner shown) also fades the image in, a fast one appears instantly
  const [showSpinner, setShowSpinner] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
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
            // First (possibly only) tap: remember it (so a second tap can still
            // upgrade to a double-tap zoom) and, when enabled, defer the close.
            g.lastTapT = e.timeStamp
            g.lastTapX = g.downX
            g.lastTapY = g.downY
            if (tapToClose) {
              cancelPendingClose()
              closeTimerRef.current = setTimeout(() => {
                closeTimerRef.current = null
                onClose()
              }, DOUBLE_TAP_MS)
            }
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
  }, [metrics, fitScale, clamp, apply, reset, cancelPendingClose, onClose, tapToClose])

  // Mouse gestures (desktop): wheel zoom around the cursor, drag to pan,
  // double-click to toggle zoom.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const toLocal = (clientX: number, clientY: number) => {
      const m = metrics()
      if (!m) return { x: 0, y: 0 }
      return { x: (clientX - m.left) / m.scaleFactor, y: (clientY - m.top) / m.scaleFactor }
    }

    const drag = { active: false, lastX: 0, lastY: 0 }
    // Track a clean click so a click on the empty area around the image closes
    const click = { downX: 0, downY: 0, moved: false, tracking: false }

    // Wheel intent (mirrors qa-tool ZoomCanvas): a trackpad pinch arrives as a
    // wheel with ctrlKey synthesised by the OS → zoom; a real mouse wheel is a
    // chunky delta / non-pixel deltaMode → zoom; a trackpad two-finger swipe is
    // small pixel deltas → pan. The verdict is locked per gesture so a velocity
    // spike mid-swipe doesn't flip pan into zoom.
    const GESTURE_GAP_MS = 150
    const wheelGesture = { intent: null as 'pan' | 'zoom' | null, lastAt: 0 }

    const onWheel = (e: WheelEvent) => {
      const m = metrics()
      const nat = natRef.current
      if (!m || !nat) return
      // In a pager, a plain wheel at fit scale scrolls/pages instead of zooming.
      const atFit = tfRef.current.s <= fitScale(m.cw, m.ch) * 1.01
      if (allowPageScroll && !e.ctrlKey && atFit) return
      e.preventDefault()
      setAnimate(false)

      const now = e.timeStamp
      if (now - wheelGesture.lastAt > GESTURE_GAP_MS) wheelGesture.intent = null
      wheelGesture.lastAt = now

      const isPinch = e.ctrlKey
      const looksLikeMouseWheel =
        e.deltaMode !== 0 || Math.abs(e.deltaY) >= 80 || Math.abs(e.deltaX) >= 80
      if (isPinch) wheelGesture.intent = 'zoom'
      else if (wheelGesture.intent === null) wheelGesture.intent = looksLikeMouseWheel ? 'zoom' : 'pan'

      const { s, tx, ty } = tfRef.current

      if (wheelGesture.intent === 'pan') {
        apply(clamp({ s, tx: tx - e.deltaX, ty: ty - e.deltaY }))
        return
      }

      const fit = fitScale(m.cw, m.ch)
      const p = toLocal(e.clientX, e.clientY)
      const imgX = (p.x - tx) / s
      const imgY = (p.y - ty) / s
      // Pinch deltas are tiny, mouse-wheel deltas are chunky → different gains.
      const sensitivity = isPinch ? 0.005 : 0.0015
      const factor = Math.exp(-e.deltaY * sensitivity)
      const newS = Math.max(fit, Math.min(fit * MAX_ZOOM, s * factor))
      apply(clamp({ s: newS, tx: p.x - imgX * newS, ty: p.y - imgY * newS }))
    }

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const m = metrics()
      const nat = natRef.current
      if (!m || !nat) return
      const p = toLocal(e.clientX, e.clientY)
      click.downX = p.x
      click.downY = p.y
      click.moved = false
      click.tracking = true
      const { s } = tfRef.current
      const canPan = nat.w * s > m.cw + 0.5 || nat.h * s > m.ch + 0.5
      if (canPan) {
        e.preventDefault()
        setAnimate(false)
        drag.active = true
        drag.lastX = p.x
        drag.lastY = p.y
        el.style.cursor = 'grabbing'
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!drag.active) return
      const p = toLocal(e.clientX, e.clientY)
      const dx = p.x - drag.lastX
      const dy = p.y - drag.lastY
      drag.lastX = p.x
      drag.lastY = p.y
      click.moved = true
      const { s, tx, ty } = tfRef.current
      apply(clamp({ s, tx: tx + dx, ty: ty + dy }))
    }

    const onMouseUp = () => {
      if (drag.active) {
        drag.active = false
        el.style.cursor = ''
      }
      // A clean click on the empty area around the image dismisses the viewer
      if (click.tracking && !click.moved) {
        const nat = natRef.current
        if (nat) {
          const { s, tx, ty } = tfRef.current
          const inside =
            click.downX >= tx &&
            click.downX <= tx + nat.w * s &&
            click.downY >= ty &&
            click.downY <= ty + nat.h * s
          if (!inside) onClose()
        }
      }
      click.tracking = false
    }

    const onDblClick = (e: MouseEvent) => {
      const m = metrics()
      const nat = natRef.current
      if (!m || !nat) return
      e.preventDefault()
      const fit = fitScale(m.cw, m.ch)
      setAnimate(true)
      if (tfRef.current.s > fit * 1.05) {
        reset()
      } else {
        const p = toLocal(e.clientX, e.clientY)
        const newS = fit * DOUBLE_TAP_ZOOM
        const { s, tx, ty } = tfRef.current
        const imgX = (p.x - tx) / s
        const imgY = (p.y - ty) / s
        apply(clamp({ s: newS, tx: p.x - imgX * newS, ty: p.y - imgY * newS }))
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('dblclick', onDblClick)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('dblclick', onDblClick)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [metrics, fitScale, clamp, apply, reset, onClose, allowPageScroll])

  // Clear any pending single-tap close on unmount.
  useEffect(() => () => cancelPendingClose(), [cancelPendingClose])

  // Show the spinner only if loading takes longer than 100ms.
  useEffect(() => {
    if (ready) {
      setShowSpinner(false)
      return
    }
    const t = setTimeout(() => {
      setShowSpinner(true)
      setFadeIn(true)
    }, 100)
    return () => clearTimeout(t)
  }, [ready])

  // Report the displayed image rectangle so the parent can anchor controls.
  useEffect(() => {
    if (!onImageBox) return
    const nat = natRef.current
    const m = metrics()
    if (!ready || !nat || !m) {
      onImageBox(null)
      return
    }
    const fit = fitScale(m.cw, m.ch)
    const fitBottom = (m.ch + nat.h * fit) / 2
    onImageBox({
      left: tf.tx,
      top: tf.ty,
      right: tf.tx + nat.w * tf.s,
      bottom: tf.ty + nat.h * tf.s,
      fitBottom,
      containerW: m.cw,
    })
  }, [tf, ready, onImageBox, metrics, fitScale])

  const nat = natRef.current

  // Hidden until loaded, then fades in (like RemoteImage); double-tap also
  // animates the transform.
  const transitions = [
    // Fade in only after a slow load; a fast (cached) load appears instantly
    fadeIn && 'opacity 0.3s ease-out',
    animate && 'transform 0.2s ease-out',
  ].filter(Boolean)
  const imgStyle: React.CSSProperties =
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
          opacity: 1,
          transition: transitions.length ? transitions.join(', ') : undefined,
        }
      : { opacity: 0 }

  return (
    // onClick is the non-touch fallback for tap-to-close (mobile); on touch the
    // tap path above already calls onClose and cancels the synthesized click.
    // Desktop (tapToClose=false) closes via the X / backdrop instead.
    <div
      ref={containerRef}
      className={styles.container}
      onClick={tapToClose ? () => onClose() : undefined}
    >
      {!ready && showSpinner && <Loader onDark />}
      <img
        src={src}
        alt={alt}
        draggable={false}
        onLoad={handleImgLoad}
        className={styles.image}
        style={imgStyle}
      />
    </div>
  )
}

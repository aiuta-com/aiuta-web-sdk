import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { RemoteImage } from '@/components'
import { combineClassNames } from '@/utils'
import type { ModelsListProps } from './types'
import styles from './ModelsList.module.scss'

// The card at the viewport center reaches this scale (44×70 base → ~50×80);
// cards a full pitch away sit at 1. Interpolated by scroll distance.
const MAX_SCALE = 80 / 70

export const ModelsList = ({
  models,
  selectedModelId,
  onModelSelect,
  className,
}: ModelsListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const leadSpacerRef = useRef<HTMLDivElement>(null)
  const trailSpacerRef = useRef<HTMLDivElement>(null)
  const isScrollingProgrammaticallyRef = useRef(false)
  const isScrollingManuallyRef = useRef(false)
  // Only a real user gesture (touch / wheel) may change the selection on scroll;
  // scrolls from the initial layout, spacer sizing or the active-card width
  // animation must not (they'd pick a random card on open).
  const userInteractedRef = useRef(false)
  // First centering is instant (before paint); later selection changes animate
  const hasCenteredRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const scaleRafRef = useRef<number | null>(null)
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const programmaticTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Scale each card by how close its center is to the viewport center (the
  // centered card grows, neighbours shrink to the base size as they move away),
  // and translate cards outward so the scaled-up ones don't eat the gap — the
  // visual gap between cards stays equal to the layout gap. All math is in
  // layout coords (offsetLeft, unaffected by the transform) → no feedback.
  const updateScales = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card]'))
    if (cards.length === 0) return
    const base = cards[0].offsetWidth || 44
    const pitch = cards.length >= 2 ? cards[1].offsetLeft - cards[0].offsetLeft : base + 4
    const viewportCenter = el.scrollLeft + el.clientWidth / 2

    // Scale per card, and the card nearest the center (anchor: it keeps tx 0 so
    // it stays exactly centered).
    let anchor = 0
    let best = Infinity
    const scales = cards.map((card, i) => {
      const center = card.offsetLeft + card.offsetWidth / 2
      const dist = Math.abs(center - viewportCenter)
      if (dist < best) {
        best = dist
        anchor = i
      }
      return 1 + (MAX_SCALE - 1) * Math.max(0, 1 - dist / pitch)
    })

    // Push neighbours out by the cumulative half-overflow so gaps stay constant.
    const tx = new Array<number>(cards.length).fill(0)
    for (let i = anchor + 1; i < cards.length; i++) {
      tx[i] = tx[i - 1] + (base / 2) * (scales[i - 1] + scales[i] - 2)
    }
    for (let i = anchor - 1; i >= 0; i--) {
      tx[i] = tx[i + 1] - (base / 2) * (scales[i] + scales[i + 1] - 2)
    }

    cards.forEach((card, i) => {
      card.style.transform = `translateX(${tx[i]}px) scale(${scales[i]})`
    })
  }, [])

  // Scroll a card to the exact center. Flags the scroll as programmatic so the
  // resulting scroll events don't re-run the selection/center logic, and clears
  // that flag after the scroll settles (so it never gets stuck).
  const centerCard = useCallback((target: HTMLElement | null, behavior: ScrollBehavior) => {
    const el = containerRef.current
    if (!el || !target) return
    const left = target.offsetLeft - el.clientWidth / 2 + target.offsetWidth / 2
    isScrollingProgrammaticallyRef.current = true
    el.scrollTo({ left, behavior })
    if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current)
    programmaticTimerRef.current = setTimeout(
      () => {
        isScrollingProgrammaticallyRef.current = false
      },
      behavior === 'smooth' ? 500 : 80,
    )
  }, [])

  // Find and select the card closest to the viewport center
  const selectCenterCard = useCallback(() => {
    // Ignore scrolls that aren't from a real user gesture (init / layout)
    if (!userInteractedRef.current) return
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const centerX = containerRect.left + containerRect.width / 2

    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-card]'))
    let closest: HTMLElement | null = null
    let minDistance = Infinity
    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect()
      const distance = Math.abs(cardRect.left + cardRect.width / 2 - centerX)
      if (distance < minDistance) {
        minDistance = distance
        closest = card
      }
    })

    if (closest) {
      const index = cards.indexOf(closest)
      if (index >= 0 && index < models.length && models[index].id !== selectedModelId) {
        onModelSelect(models[index])
      }
    }
  }, [models, selectedModelId, onModelSelect])

  // Handle scroll - select card in real-time with throttle
  const handleScroll = useCallback(() => {
    // Scale follows the scroll position always (even programmatic / pre-gesture)
    if (scaleRafRef.current) cancelAnimationFrame(scaleRafRef.current)
    scaleRafRef.current = requestAnimationFrame(updateScales)

    if (isScrollingProgrammaticallyRef.current) return
    // Ignore scrolls before the first real gesture (initial layout / spacer
    // sizing): they must not flag "manual scrolling" and suppress the centering.
    if (!userInteractedRef.current) return

    isScrollingManuallyRef.current = true
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current)
    }
    manualScrollTimeoutRef.current = setTimeout(() => {
      isScrollingManuallyRef.current = false
    }, 150)

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(selectCenterCard)
  }, [selectCenterCard, updateScales])

  // Real lead/trailing spacers (half the viewport minus half a card) so that
  // ANY card — including the first and last — can be scrolled to the exact
  // center, and there's always something to scroll even when all cards fit.
  // Spacer elements (not container padding) because browsers don't count
  // trailing padding in the scroll area.
  const updateSpacers = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    // Base (unscaled) card width — the centering math works in layout space.
    const cardWidth =
      (selectedRef.current ?? el.querySelector<HTMLElement>('[data-card]'))?.offsetWidth || 44
    const width = Math.max(0, (el.clientWidth - cardWidth) / 2)
    if (leadSpacerRef.current) leadSpacerRef.current.style.width = `${width}px`
    if (trailSpacerRef.current) trailSpacerRef.current.style.width = `${width}px`
    // Re-center the selected (or first) card instantly after a size change, so
    // the first paint and orientation changes land centered (no slide). Skip
    // while the user is actively scrolling so we don't yank their scroll.
    if (!isScrollingManuallyRef.current) {
      centerCard(selectedRef.current ?? el.querySelector<HTMLElement>('[data-card]'), 'auto')
    }
    // Apply the scale for the (now-centered) position before paint
    updateScales()
  }, [centerCard, updateScales])

  // Layout effect so the spacers are sized before paint (no flash of the
  // left-aligned list before it centers).
  useLayoutEffect(() => {
    updateSpacers()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(updateSpacers)
    ro.observe(el, { box: 'border-box' })
    return () => ro.disconnect()
  }, [updateSpacers, models.length])

  // Cleanup RAF and timeouts
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (scaleRafRef.current) {
        cancelAnimationFrame(scaleRafRef.current)
      }
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current)
      }
      if (programmaticTimerRef.current) {
        clearTimeout(programmaticTimerRef.current)
      }
    }
  }, [])

  // Center the selected model on selection change (unless the user is scrolling).
  // Layout effect so the first centering is before paint (instant, no slide);
  // later selection changes animate smoothly.
  useLayoutEffect(() => {
    if (isScrollingManuallyRef.current) return
    centerCard(selectedRef.current, hasCenteredRef.current ? 'smooth' : 'auto')
    hasCenteredRef.current = true
  }, [selectedModelId, centerCard])

  return (
    <div
      ref={containerRef}
      className={combineClassNames(styles.modelsList, className)}
      data-scrollable
      onScroll={handleScroll}
      onTouchStart={() => {
        userInteractedRef.current = true
      }}
      onWheel={() => {
        userInteractedRef.current = true
      }}
    >
      <div ref={leadSpacerRef} className={styles.spacer} aria-hidden="true" />

      {models.map((model) => {
        const isSelected = model.id === selectedModelId

        return (
          <div
            key={model.id}
            data-card
            ref={isSelected ? selectedRef : null}
            className={styles.modelCard}
            onClick={() => onModelSelect(model)}
          >
            <RemoteImage src={model.url} alt="Model" shape="XS" />
          </div>
        )
      })}

      <div ref={trailSpacerRef} className={styles.spacer} aria-hidden="true" />
    </div>
  )
}

import React, { useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { RemoteImage } from '@/components'
import { combineClassNames } from '@/utils'
import type { ModelsListProps } from './types'
import styles from './ModelsList.module.scss'

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
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const programmaticTimerRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [selectCenterCard])

  // Real lead/trailing spacers (half the viewport minus half a card) so that
  // ANY card — including the first and last — can be scrolled to the exact
  // center, and there's always something to scroll even when all cards fit.
  // Spacer elements (not container padding) because browsers don't count
  // trailing padding in the scroll area.
  const updateSpacers = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const cardWidth = selectedRef.current?.offsetWidth || 50
    const width = Math.max(0, (el.clientWidth - cardWidth) / 2)
    if (leadSpacerRef.current) leadSpacerRef.current.style.width = `${width}px`
    if (trailSpacerRef.current) trailSpacerRef.current.style.width = `${width}px`
    // Re-center the selected (or first) card instantly after a size change, so
    // the first paint and orientation changes land centered (no slide). Skip
    // while the user is actively scrolling so we don't yank their scroll.
    if (!isScrollingManuallyRef.current) {
      centerCard(selectedRef.current ?? el.querySelector<HTMLElement>('[data-card]'), 'auto')
    }
  }, [centerCard])

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
            className={combineClassNames(
              styles.modelCard,
              isSelected ? styles.modelCard_selected : '',
            )}
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

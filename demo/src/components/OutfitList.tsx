import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import OutfitCard from './OutfitCard'
import Spinner from './Spinner'
import type { OutfitsApiResponse } from '../models/product'

const ALL_FILTER_VALUE = 'all'

interface Props {
  outfits: OutfitsApiResponse[]
  loading: boolean
  onTryOn: (skuIds: string[]) => void
}

export default function OutfitList({ outfits, loading, onTryOn }: Props) {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER_VALUE)
  // Fractional scroll position (0 = first card, 1 = second, ...) so the pager can
  // render the in-between state continuously while dragging.
  const [progress, setProgress] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const filters = useMemo(() => {
    const styles = Array.from(
      new Set(
        outfits
          .map((outfit) => outfit.style?.trim())
          .filter((style): style is string => Boolean(style)),
      ),
    )
    return [
      { value: ALL_FILTER_VALUE, label: 'All occasions' },
      ...styles.map((style) => ({ value: style, label: style })),
    ]
  }, [outfits])

  const filteredOutfits = useMemo(() => {
    if (activeFilter === ALL_FILTER_VALUE) return outfits
    return outfits.filter((outfit) => outfit.style?.trim() === activeFilter)
  }, [outfits, activeFilter])

  // Reset to "all" if the active filter disappears after a catalog refresh.
  useEffect(() => {
    if (!filters.some((filter) => filter.value === activeFilter)) {
      setActiveFilter(ALL_FILTER_VALUE)
    }
  }, [filters, activeFilter])

  const getCards = useCallback(
    (): HTMLElement[] =>
      Array.from(viewportRef.current?.querySelectorAll<HTMLElement>('.outfit__card') ?? []),
    [],
  )

  const getLeadingOffset = useCallback((): number => getCards()[0]?.offsetLeft ?? 0, [getCards])

  const getScrollStep = useCallback((): number => {
    const viewport = viewportRef.current
    const firstCard = getCards()[0]
    if (!viewport || !firstCard) return 0
    const track = viewport.querySelector<HTMLElement>('.outfit__track')
    const style = track ? window.getComputedStyle(track) : null
    const gap = style ? Number.parseFloat(style.columnGap || style.gap || '0') : 0
    return firstCard.getBoundingClientRect().width + gap
  }, [getCards])

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const { scrollLeft, clientWidth, scrollWidth } = viewport
    const cards = getCards()

    setCanScrollPrev(scrollLeft > 1)
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1)
    setHasOverflow(scrollWidth > clientWidth + 1)

    if (!cards.length) {
      setProgress(0)
      return
    }

    // Fractional card index under the left edge (cards are evenly spaced).
    const step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0
    const raw = step > 0 ? scrollLeft / step : 0
    setProgress(Math.max(0, Math.min(raw, cards.length - 1)))
  }, [getCards])

  useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [updateScrollState])

  // Re-evaluate scroll affordances and snap to the start when the list changes.
  useEffect(() => {
    viewportRef.current?.scrollTo({ left: 0, behavior: 'auto' })
    setProgress(0)
    const id = window.requestAnimationFrame(updateScrollState)
    return () => window.cancelAnimationFrame(id)
  }, [filteredOutfits, loading, updateScrollState])

  const goPrev = () => {
    const step = getScrollStep()
    if (step) viewportRef.current?.scrollBy({ left: -step, behavior: 'smooth' })
  }

  const goNext = () => {
    const step = getScrollStep()
    if (step) viewportRef.current?.scrollBy({ left: step, behavior: 'smooth' })
  }

  const setIndex = (index: number) => {
    const viewport = viewportRef.current
    const targetCard = getCards()[index]
    if (!viewport || !targetCard) return
    viewport.scrollTo({ left: targetCard.offsetLeft - getLeadingOffset(), behavior: 'smooth' })
  }

  if (!outfits.length && !loading) return null

  const hasControls = !loading && hasOverflow
  const showFilters = filters.length > 1 && !loading

  return (
    <div className="outfit">
      <div className="outfit__header">
        <div className="outfit__title-wrap">
          <h2 className="outfit__title">Outfit Visualization</h2>
        </div>
      </div>

      {/* While loading, assume the catalog has filters and keep the row
          reserved — it collapses only when the loaded data has none. */}
      {loading || showFilters || hasControls ? (
        <div className="outfit__toolbar">
          {showFilters ? (
            <div className="outfit__filters" role="tablist" aria-label="Outfit filters">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={
                    'outfit__filter' +
                    (activeFilter === filter.value ? ' outfit__filter--active' : '')
                  }
                  aria-selected={activeFilter === filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          ) : null}
          {hasControls ? (
            <div className="outfit__controls">
              <button
                type="button"
                className="outfit__control-btn"
                aria-label="Previous"
                disabled={!canScrollPrev}
                onClick={goPrev}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M14.5 7l-5 5 5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="outfit__control-btn"
                aria-label="Next"
                disabled={!canScrollNext}
                onClick={goNext}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9.5 7l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div ref={viewportRef} className="outfit__viewport" onScroll={updateScrollState}>
        <div className="outfit__track">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div className="outfit__card" key={index}>
                  <div className="outfit__skeleton-card">
                    <Spinner />
                  </div>
                </div>
              ))
            : filteredOutfits.map((outfit, index) => (
                <div className="outfit__card" key={index}>
                  <OutfitCard
                    outfit={outfit}
                    onTryOn={(o) => onTryOn(o.items.map((i) => i.sku_id))}
                  />
                </div>
              ))}
        </div>
      </div>

      {/* Always rendered so its height is reserved on mobile (no jump in the gap
          to the next section when a filter has too few outfits to page). */}
      <div className="outfit__dots" role="tablist" aria-label="Outfit pagination">
        {!loading &&
          filteredOutfits.length > 1 &&
          filteredOutfits.map((_, index) => {
            // Closeness of this dot to the current scroll position (1 = exactly
            // here, 0 = a full card away) — drives the pill width/shade so the
            // active indicator glides between dots as you drag.
            const t = Math.max(0, 1 - Math.abs(index - progress))
            const shade = Math.round(217 - 200 * t)
            return (
              <button
                key={index}
                type="button"
                aria-label={`Go to outfit ${index + 1}`}
                aria-selected={Math.round(progress) === index}
                className="outfit__dot"
                style={{
                  width: `${6 + 18 * t}px`,
                  backgroundColor: `rgb(${shade}, ${shade}, ${shade})`,
                }}
                onClick={() => setIndex(index)}
              />
            )
          })}
      </div>
    </div>
  )
}

import React, { useEffect, useRef } from 'react'
import { useImageGradient } from '../hooks/useImageGradient'
import { createRipple } from '../utils/ripple'
import RetryImage from './RetryImage'
import Spinner from './Spinner'
import TryOnIcon from './icons/TryOnIcon'
import type { CatalogItem } from '../models/product'
import type { AiutaMode } from '@sdk/index'

interface Props {
  items: CatalogItem[]
  loading: boolean
  /** A further page is being appended below the already shown items */
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  apiKey: string
  onTryOn: (skuId: string, mode?: AiutaMode) => void
}

function SkeletonCard() {
  return (
    <div className="sku-card">
      <div className="sku-card__inner">
        <div className="sku-card__loading">
          <Spinner />
        </div>
        {/* Same content block as a loaded card with a one-line title
            (the common case), so the grid doesn't shift on load. */}
        <div className="sku-card__content">
          <div className="sku-card__title">
            <span className="sku-card__title-skeleton" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkuList({
  items,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  apiKey,
  onTryOn,
}: Props) {
  const { getBgStyle, isMultiplied, initGradient } = useImageGradient()

  // Infinite scroll: ask for the next page when the sentinel below the grid
  // comes close to the viewport. Recreated when the list grows so a sentinel
  // that stays visible (short page) keeps triggering further loads.
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMoreRef.current()
      },
      { rootMargin: '800px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, items.length])

  // hasMore guards the case where every item of the first page was filtered
  // out (not try-on ready) but further pages may still have showable items
  if (!items.length && !loading && !hasMore) {
    return (
      <h3 className="catalog-empty">
        The catalog with the <b>{apiKey}</b> code is empty
      </h3>
    )
  }

  return (
    <section className="skus">
      <h2>Single-Item Try-On</h2>
      <div className="sku-grid">
        {loading && !items.length
          ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
          : items.map((item) => {
              const image = item.image_url
              return (
                <div
                  className="sku-card sku-card--clickable"
                  key={item.sku_id}
                  onClick={() => onTryOn(item.sku_id, item.mode)}
                >
                  <div className="sku-card__inner" onPointerDown={createRipple}>
                    <div className="sku-card__item" style={getBgStyle(item.sku_id)}>
                      <RetryImage
                        src={image}
                        alt={item.title}
                        loading="lazy"
                        className={
                          'sku-card__image' +
                          (isMultiplied(item.sku_id) ? ' sku-card__image--multiply' : '')
                        }
                        onLoad={() => void initGradient(item.sku_id, image)}
                      />
                    </div>
                    <div className="sku-card__overlay">
                      <button
                        type="button"
                        className="btn btn--white sku-card__try-on"
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          createRipple(event)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          onTryOn(item.sku_id, item.mode)
                        }}
                      >
                        <TryOnIcon className="btn__icon" />
                        <span>Try On</span>
                      </button>
                    </div>
                    <div className="sku-card__content">
                      {item.brand ? <div className="sku-card__brand">{item.brand}</div> : null}
                      <div className="sku-card__title">{item.title}</div>
                    </div>
                  </div>
                </div>
              )
            })}
        {loadingMore &&
          Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`more-${index}`} />)}
      </div>
      {hasMore && <div className="sku-grid__sentinel" ref={sentinelRef} aria-hidden="true" />}
    </section>
  )
}

import React, { useMemo, useState } from 'react'
import { useImageGradient } from '../hooks/useImageGradient'
import { createRipple } from '../utils/ripple'
import RetryImage from './RetryImage'
import TryOnIcon from './icons/TryOnIcon'
import type { Outfit } from '../models/product'

interface Props {
  outfit: Outfit
  onTryOn: (outfit: Outfit) => void
}

export default function OutfitCard({ outfit, onTryOn }: Props) {
  const { getBgStyle, isMultiplied, initGradient } = useImageGradient()
  const [collageFailed, setCollageFailed] = useState(false)

  // The normalizer only lets absolute, non-"/None" URLs through.
  const showCollage = Boolean(outfit.collageUrl) && !collageFailed

  const gridItems = useMemo(() => outfit.items.slice(0, 6), [outfit.items])
  const gridSize = Math.min(Math.max(gridItems.length, 1), 6)

  // Explicit title when the format provides one; the occasion tag (e.g.
  // "Office Hours") is the closest human-readable fallback, then style.
  // Occasion is NOT a title fallback — it lives in the subtitle (the main
  // demo page's treatment), so it never shows twice.
  const title = outfit.title || outfit.style || 'Outfit'
  const subtitle = [
    outfit.occasion,
    `${outfit.skuIds.length} ${outfit.skuIds.length === 1 ? 'item' : 'items'}`,
  ]
    .filter(Boolean)
    .join(' • ')

  // Same corner-gradient / white-bg multiply fill as the SKU cards, keyed by the
  // collage URL (the outfit's lead image).
  const collageKey = outfit.collageUrl ?? ''

  return (
    <div className="outfit-card outfit-card--clickable" onClick={() => onTryOn(outfit)}>
      <div className="outfit-card__inner" onPointerDown={createRipple}>
        <div className="outfit-card__item" style={showCollage ? getBgStyle(collageKey) : undefined}>
          {showCollage ? (
            <RetryImage
              src={outfit.collageUrl ?? ''}
              alt={title}
              loading="lazy"
              // No icon: a failed collage falls back to the item grid below.
              fallback="none"
              className={
                'outfit-card__image' +
                (isMultiplied(collageKey) ? ' outfit-card__image--multiply' : '')
              }
              onLoad={() => void initGradient(collageKey, outfit.collageUrl ?? '')}
              onError={() => setCollageFailed(true)}
            />
          ) : (
            <div className={`outfit-card__grid outfit-card__grid--${gridSize}`}>
              {gridItems.map((item) => (
                <div
                  key={item.skuId}
                  className="outfit-card__grid-item"
                  style={getBgStyle(item.skuId)}
                >
                  {/* An unresolved id stays a bare gray tile — the image pops
                      in reactively once its catalog page arrives. */}
                  {item.imageUrl && (
                    <RetryImage
                      src={item.imageUrl}
                      alt={item.title ?? ''}
                      loading="lazy"
                      className={
                        'outfit-card__image' +
                        (isMultiplied(item.skuId) ? ' outfit-card__image--multiply' : '')
                      }
                      onLoad={() => void initGradient(item.skuId, item.imageUrl)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Inside the fixed-ratio image box, so the button sits at the same
              spot regardless of the title line count (like the SKU cards) */}
          <div className="outfit-card__overlay">
            <button
              type="button"
              className="btn btn--white outfit-card__try-on"
              onPointerDown={(event) => {
                event.stopPropagation()
                createRipple(event)
              }}
              onClick={(event) => {
                event.stopPropagation()
                onTryOn(outfit)
              }}
            >
              <TryOnIcon className="btn__icon" />
              <span>Try On</span>
            </button>
          </div>
        </div>

        <div className="outfit-card__content">
          <div className="outfit-card__title">{title}</div>
          <div className="outfit-card__count">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

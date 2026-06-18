import React, { useMemo, useState } from 'react'
import { useImageGradient } from '../hooks/useImageGradient'
import { createRipple } from '../utils/ripple'
import RetryImage from './RetryImage'
import TryOnIcon from './icons/TryOnIcon'
import type { OutfitsApiResponse } from '../models/product'

interface Props {
  outfit: OutfitsApiResponse
  onTryOn: (outfit: OutfitsApiResponse) => void
}

// The outfits API serializes missing images as a URL ending in "None" (Python
// None stringified by the backend), which 404s — treat those as absent.
const isUsableImage = (url?: string): boolean => Boolean(url) && !/\/None$/i.test(url ?? '')

export default function OutfitCard({ outfit, onTryOn }: Props) {
  const { getBgStyle, isMultiplied, initGradient } = useImageGradient()
  const [collageFailed, setCollageFailed] = useState(false)

  const showCollage = isUsableImage(outfit.collage_image_url) && !collageFailed

  const gridItems = useMemo(
    () =>
      outfit.items.slice(0, 6).map((item) => {
        const imageUrl = [item.descriptive_image_urls[0], item.image_urls[0]].find(isUsableImage)
        return { item, imageUrl: imageUrl ?? '' }
      }),
    [outfit.items],
  )
  const gridSize = Math.min(Math.max(outfit.items.length, 1), 6)
  const itemCount = outfit.items.length

  // The API exposes no outfit name; the occasion tag (e.g. "Office Hours") is
  // the closest human-readable title, with style as a fallback.
  const title = outfit.tags?.occasion || outfit.tags?.style || 'Outfit'

  // Same corner-gradient / white-bg multiply fill as the SKU cards, keyed by the
  // collage URL (the outfit's lead image).
  const collageKey = outfit.collage_image_url ?? ''

  return (
    <div className="outfit-card outfit-card--clickable" onClick={() => onTryOn(outfit)}>
      <div className="outfit-card__inner" onPointerDown={createRipple}>
        <div
          className="outfit-card__item"
          style={showCollage ? getBgStyle(collageKey) : undefined}
        >
          {showCollage ? (
            <RetryImage
              src={outfit.collage_image_url}
              alt={title}
              loading="lazy"
              // No icon: a failed collage falls back to the item grid below.
              fallback="none"
              className={
                'outfit-card__image' +
                (isMultiplied(collageKey) ? ' outfit-card__image--multiply' : '')
              }
              onLoad={() => void initGradient(collageKey, outfit.collage_image_url)}
              onError={() => setCollageFailed(true)}
            />
          ) : (
            <div className={`outfit-card__grid outfit-card__grid--${gridSize}`}>
              {gridItems.map(({ item, imageUrl }) => (
                <div
                  key={item.sku_id}
                  className="outfit-card__grid-item"
                  style={getBgStyle(item.sku_id)}
                >
                  <RetryImage
                    src={imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className={
                      'outfit-card__image' +
                      (isMultiplied(item.sku_id) ? ' outfit-card__image--multiply' : '')
                    }
                    onLoad={() => void initGradient(item.sku_id, imageUrl)}
                  />
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
          <div className="outfit-card__count">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>
    </div>
  )
}

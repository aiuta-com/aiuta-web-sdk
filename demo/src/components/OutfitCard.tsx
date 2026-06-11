import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useImageGradient } from '../hooks/useImageGradient'
import { createRipple } from '../utils/ripple'
import RetryImage from './RetryImage'
import TryOnIcon from './icons/TryOnIcon'
import type { OutfitsApiResponse } from '../models/product'

interface Props {
  outfit: OutfitsApiResponse
  onTryOn: (outfit: OutfitsApiResponse) => void
}

// Delay before the model image shows, so sweeping the cursor across cards
// doesn't flicker — only a deliberate hover reveals it.
const HOVER_DELAY_MS = 180

// Only reveal the model image where there's a real hovering pointer. On touch a
// tap fires mouseenter with no matching mouseleave, so the image would "stick".
const SUPPORTS_HOVER =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

// The outfits API serializes missing images as a URL ending in "None" (Python
// None stringified by the backend), which 404s — treat those as absent.
const isUsableImage = (url?: string): boolean => Boolean(url) && !/\/None$/i.test(url ?? '')

export default function OutfitCard({ outfit, onTryOn }: Props) {
  const { getBgStyle, initGradient } = useImageGradient()
  const [hovered, setHovered] = useState(false)
  const [collageFailed, setCollageFailed] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
  }

  const handleEnter = () => {
    if (!SUPPORTS_HOVER) return
    clearHoverTimer()
    hoverTimer.current = setTimeout(() => setHovered(true), HOVER_DELAY_MS)
  }

  const handleLeave = () => {
    clearHoverTimer()
    setHovered(false)
  }

  // Clear any pending hover timer on unmount.
  useEffect(() => clearHoverTimer, [])

  const hasModelImage = isUsableImage(outfit.model_image_url)
  const showCollage = isUsableImage(outfit.collage_image_url) && !collageFailed
  const hideMedia = hasModelImage && hovered && modelLoaded

  const gridItems = useMemo(
    () =>
      outfit.items.slice(0, 6).map((item) => {
        const imageUrl = [item.descriptive_image_urls[0], item.image_urls[0]].find(isUsableImage)
        return { item, imageUrl: imageUrl ?? '' }
      }),
    [outfit.items],
  )
  const gridSize = Math.min(Math.max(outfit.items.length, 1), 6)
  const subtitle = [outfit.style, `${outfit.items.length} Items`].filter(Boolean).join(' • ')

  return (
    <div
      className="outfit-card"
      onClick={() => onTryOn(outfit)}
      onPointerDown={createRipple}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {hasModelImage ? (
        <RetryImage
          src={outfit.model_image_url}
          alt={outfit.title}
          loading="lazy"
          // No icon: a failed model image just disables the hover reveal.
          fallback="none"
          className={
            'outfit-card__model-image' + (hovered ? ' outfit-card__model-image--visible' : '')
          }
          onLoad={() => setModelLoaded(true)}
          onError={() => setModelLoaded(false)}
        />
      ) : null}

      <div className={'outfit-card__media' + (hideMedia ? ' outfit-card__media--hidden' : '')}>
        {showCollage ? (
          <RetryImage
            src={outfit.collage_image_url}
            alt={outfit.title}
            loading="lazy"
            // No icon: a failed collage falls back to the item grid below.
            fallback="none"
            className="outfit-card__collage-image"
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
                  className="outfit-card__image"
                  onLoad={() => void initGradient(item.sku_id, imageUrl)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="outfit-card__footer">
        <div className="outfit-card__meta">
          <div className="outfit-card__title">{outfit.title}</div>
          <div className="outfit-card__subtitle">{subtitle}</div>
        </div>
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
  )
}

import React from 'react'
import { useImageGradient } from '../hooks/useImageGradient'
import { createRipple } from '../utils/ripple'
import RetryImage from './RetryImage'
import Spinner from './Spinner'
import TryOnIcon from './icons/TryOnIcon'
import type { SkuItem } from '../models/product'
import type { AiutaMode } from '@sdk/index'

interface Props {
  items: SkuItem[]
  loading: boolean
  apiKey: string
  onTryOn: (skuId: string, mode?: AiutaMode) => void
}

export default function SkuList({ items, loading, apiKey, onTryOn }: Props) {
  const { getBgStyle, initGradient } = useImageGradient()

  if (!items.length && !loading) {
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
          ? Array.from({ length: 8 }).map((_, index) => (
              <div className="sku-card" key={index}>
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
            ))
          : items.map((item) => {
              const image = item.descriptive_image_urls[0] ?? item.image_urls[0] ?? ''
              return (
                <div
                  className="sku-card sku-card--clickable"
                  key={item.sku_id}
                  onClick={() => onTryOn(item.sku_id)}
                >
                  <div className="sku-card__inner" onPointerDown={createRipple}>
                    <div className="sku-card__item" style={getBgStyle(item.sku_id)}>
                      <RetryImage
                        src={image}
                        alt={item.title}
                        loading="lazy"
                        className="sku-card__image"
                        onLoad={() => void initGradient(item.sku_id, image)}
                      />
                    </div>
                    <div className="sku-card__overlay">
                      {/* Temporary dev shortcut: same item in the shoes try-on mode */}
                      <button
                        type="button"
                        className="btn btn--white sku-card__shoes-try-on"
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          createRipple(event)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          onTryOn(item.sku_id, 'shoes')
                        }}
                      >
                        <span>Shoes</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn--white sku-card__try-on"
                        onPointerDown={(event) => {
                          event.stopPropagation()
                          createRipple(event)
                        }}
                        onClick={(event) => {
                          event.stopPropagation()
                          onTryOn(item.sku_id)
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
      </div>
    </section>
  )
}

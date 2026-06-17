import React from 'react'
import OutfitCard from './OutfitCard'
import Spinner from './Spinner'
import type { OutfitsApiResponse } from '../models/product'

interface Props {
  outfits: OutfitsApiResponse[]
  loading: boolean
  onTryOn: (skuIds: string[]) => void
}

export default function OutfitList({ outfits, loading, onTryOn }: Props) {
  return (
    <div className="outfit">
      <div className="outfit-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div className="outfit-card" key={index}>
                <div className="outfit-card__inner">
                  <div className="outfit-card__loading">
                    <Spinner />
                  </div>
                  {/* Same content block as a loaded card with a one-line title,
                      so the grid doesn't shift on load. */}
                  <div className="outfit-card__content">
                    <div className="outfit-card__title">
                      <span className="outfit-card__title-skeleton" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          : outfits.map((outfit, index) => (
              <OutfitCard
                key={index}
                outfit={outfit}
                onTryOn={(o) => onTryOn(o.items.map((i) => i.sku_id))}
              />
            ))}
      </div>
    </div>
  )
}

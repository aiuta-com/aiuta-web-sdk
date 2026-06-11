import React, { useEffect, useState } from 'react'
import Header from './components/Header'
import OutfitList from './components/OutfitList'
import SkuList from './components/SkuList'
import VersionBadges from './components/VersionBadges'
import { getAiuta } from './sdk'
import { demoConfig } from './utils/config'
import { fetchOutfits, fetchSkuList } from './utils/api'
import type { OutfitsApiResponse, SkuItem } from './models/product'

export default function App() {
  const [skus, setSkus] = useState<SkuItem[]>([])
  const [outfits, setOutfits] = useState<OutfitsApiResponse[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingOutfits, setLoadingOutfits] = useState(true)

  useEffect(() => {
    // Warm the SDK up so the iframe is ready before the first Try On click.
    void getAiuta()

    fetchSkuList()
      .then(setSkus)
      .catch((error) => console.error('Failed to load SKU catalog', error))
      .finally(() => setLoadingList(false))

    fetchOutfits()
      .then(setOutfits)
      .catch((error) => console.error('Failed to load outfits', error))
      .finally(() => setLoadingOutfits(false))
  }, [])

  const tryOn = (productId: string | string[]) => {
    void getAiuta().then((sdk) => sdk.tryOn(productId))
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <OutfitList outfits={outfits} loading={loadingOutfits} onTryOn={tryOn} />

        <SkuList items={skus} loading={loadingList} apiKey={demoConfig.apiKey} onTryOn={tryOn} />
      </div>

      {/* Desktop-only copy pinned to the top-right corner (the header copy is
          mobile-only) so version/env stay visible while scrolling. */}
      <VersionBadges className="app-pinned-badges" />
    </>
  )
}

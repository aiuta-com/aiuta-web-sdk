import React, { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import OutfitList from './components/OutfitList'
import SkuList from './components/SkuList'
import { loadAiuta } from './utils/sdk'
import type { AiutaInstance } from './utils/sdk'
import { demoConfig } from './utils/config'
import { fetchOutfits, fetchSkuList } from './utils/api'
import type { OutfitsApiResponse, SkuItem } from './models/product'

export default function App() {
  const [skus, setSkus] = useState<SkuItem[]>([])
  const [outfits, setOutfits] = useState<OutfitsApiResponse[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingOutfits, setLoadingOutfits] = useState(true)
  const sdkRef = useRef<Promise<AiutaInstance> | null>(null)

  const ensureSdk = (): Promise<AiutaInstance> => {
    if (!sdkRef.current) {
      sdkRef.current = loadAiuta().then(
        (Aiuta) =>
          new Aiuta({
            auth: { apiKey: demoConfig.apiKey },
            analytics: {
              handler: {
                onAnalyticsEvent: (event) => console.log('Analytics', event),
              },
            },
            debugSettings: {
              isLoggingEnabled: true,
              // Derive the app dev-server host from the page URL so the try-on
              // iframe also loads when the demo is opened from another device on
              // the LAN (e.g. http://nmac.local:9876 → http://nmac.local:9875).
              iframeAppUrl: import.meta.env.DEV
                ? `${window.location.protocol}//${window.location.hostname}:9875/`
                : undefined,
            },
          }),
      )
    }
    return sdkRef.current
  }

  useEffect(() => {
    void ensureSdk()

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
    void ensureSdk().then((sdk) => sdk.tryOn(productId))
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <OutfitList outfits={outfits} loading={loadingOutfits} onTryOn={tryOn} />

        <SkuList items={skus} loading={loadingList} apiKey={demoConfig.apiKey} onTryOn={tryOn} />
      </div>
    </>
  )
}

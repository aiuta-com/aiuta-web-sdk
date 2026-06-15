import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import Header from './components/Header'
import OutfitList from './components/OutfitList'
import SkuList from './components/SkuList'
import VersionBadges from './components/VersionBadges'
import { getAiuta } from './sdk'
import { demoConfig } from './utils/config'
import { fetchOutfits, fetchSkuPage } from './utils/api'
import { isTryOnFilterEnabled, subscribeTryOnFilter } from './utils/settings'
import type { CatalogItem, OutfitsApiResponse } from './models/product'
import type { AiutaMode } from '@sdk/index'

// Smaller extra.order first; items without one keep their fetch order at
// the end (Array.prototype.sort is stable)
const byCatalogOrder = (a: CatalogItem, b: CatalogItem) => a.order - b.order

export default function App() {
  const [skus, setSkus] = useState<CatalogItem[]>([])
  const [outfits, setOutfits] = useState<OutfitsApiResponse[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMoreSkus, setLoadingMoreSkus] = useState(false)
  const [loadingOutfits, setLoadingOutfits] = useState(true)

  // Offset of the next catalog page; null once the last page is loaded.
  // The ref mirrors the pagination state for the load-more callback so it
  // doesn't have to be recreated (and re-observed) on every page.
  const [hasMoreSkus, setHasMoreSkus] = useState(false)
  const skuPagingRef = useRef<{ nextOffset: number | null; loading: boolean }>({
    nextOffset: 0,
    loading: false,
  })

  const loadSkuPage = useCallback(async () => {
    const paging = skuPagingRef.current
    if (paging.loading || paging.nextOffset === null) return

    paging.loading = true
    const offset = paging.nextOffset
    try {
      const page = await fetchSkuPage(offset)
      // Sort within the page only and append — re-sorting the whole list on
      // every page would reshuffle already-shown items as more load
      const sortedPage = [...page.items].sort(byCatalogOrder)
      setSkus((prev) => (offset === 0 ? sortedPage : [...prev, ...sortedPage]))
      paging.nextOffset = page.nextOffset
      setHasMoreSkus(page.nextOffset !== null)
    } catch (error) {
      console.error('Failed to load SKU catalog', error)
    } finally {
      paging.loading = false
      setLoadingList(false)
      setLoadingMoreSkus(false)
    }
  }, [])

  const loadMoreSkus = useCallback(() => {
    const paging = skuPagingRef.current
    if (paging.loading || paging.nextOffset === null) return
    setLoadingMoreSkus(true)
    void loadSkuPage()
  }, [loadSkuPage])

  useEffect(() => {
    // Warm the SDK up so the iframe is ready before the first Try On click.
    void getAiuta()

    void loadSkuPage()

    fetchOutfits()
      .then(setOutfits)
      .catch((error) => console.error('Failed to load outfits', error))
      .finally(() => setLoadingOutfits(false))
  }, [loadSkuPage])

  const tryOn = (productId: string | string[], mode?: AiutaMode) => {
    void getAiuta().then((sdk) => sdk.tryOn(productId, mode))
  }

  // Gear-menu toggle: when on, only items explicitly flagged
  // extra.single_item_try_on: true stay; by default everything is shown
  const tryOnFilterEnabled = useSyncExternalStore(subscribeTryOnFilter, isTryOnFilterEnabled)
  const visibleSkus = useMemo(
    () => (tryOnFilterEnabled ? skus.filter((sku) => sku.singleItemTryOn) : skus),
    [tryOnFilterEnabled, skus],
  )

  return (
    <>
      <Header />
      <div className="page-container">
        <OutfitList outfits={outfits} loading={loadingOutfits} onTryOn={tryOn} />

        <SkuList
          items={visibleSkus}
          loading={loadingList}
          loadingMore={loadingMoreSkus}
          hasMore={hasMoreSkus}
          onLoadMore={loadMoreSkus}
          apiKey={demoConfig.apiKey}
          onTryOn={tryOn}
        />
      </div>

      {/* Desktop-only copy pinned to the top-right corner (the header copy is
          mobile-only) so version/env stay visible while scrolling. */}
      <VersionBadges className="app-pinned-badges" />
    </>
  )
}

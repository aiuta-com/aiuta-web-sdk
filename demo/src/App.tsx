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

type TabValue = 'single' | 'outfit'

const TABS: { value: TabValue; label: string }[] = [
  { value: 'single', label: 'Single-Item Try-On' },
  { value: 'outfit', label: 'Outfit Visualization' },
]

// Single-Item Try-On is the default when the hash is missing/unrecognized.
const readTabFromHash = (): TabValue => {
  const hash = window.location.hash.replace(/^#/, '')
  return TABS.some((tab) => tab.value === hash) ? (hash as TabValue) : 'single'
}

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

  // Single-Item Try-On is the default tab; outfits (which load slowly) sit
  // behind their own tab so they never hold up the main catalog view. They
  // keep loading in the background so the tab is ready when opened. The active
  // tab is mirrored in the URL hash so it survives a refresh / deep link.
  const [activeTab, setActiveTab] = useState<TabValue>(readTabFromHash)

  const selectTab = (tab: TabValue) => {
    setActiveTab(tab)
    window.location.hash = tab
  }

  // Keep the tab in sync with the hash for back/forward and manual edits.
  useEffect(() => {
    const onHashChange = () => setActiveTab(readTabFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="tabs" role="tablist" aria-label="Try-on mode">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              className={'tab' + (activeTab === tab.value ? ' tab--active' : '')}
              aria-selected={activeTab === tab.value}
              onClick={() => selectTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'single' ? (
          <SkuList
            items={visibleSkus}
            loading={loadingList}
            loadingMore={loadingMoreSkus}
            hasMore={hasMoreSkus}
            onLoadMore={loadMoreSkus}
            apiKey={demoConfig.apiKey}
            onTryOn={tryOn}
          />
        ) : (
          <OutfitList outfits={outfits} loading={loadingOutfits} onTryOn={tryOn} />
        )}
      </div>

      {/* Desktop-only copy pinned to the top-right corner (the header copy is
          mobile-only) so version/env stay visible while scrolling. */}
      <VersionBadges className="app-pinned-badges" />
    </>
  )
}

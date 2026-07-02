import { demoConfig } from './config'
import type { CatalogItem, OutfitsApiResponse, SkuItemsListResponse } from '../models/product'

const headers = (): HeadersInit => ({ 'x-api-key': demoConfig.apiKey })

// The catalog category is a free-form string; these are the footwear ones
// (current live set: Heels, Sneakers, Boots, Flats, Loafers, Slides)
const SHOE_CATEGORIES = new Set([
  'shoes',
  'footwear',
  'sneakers',
  'heels',
  'boots',
  'flats',
  'loafers',
  'slides',
  'sandals',
  'mules',
  'pumps',
  'slippers',
  'trainers',
])

const isShoeCategory = (category?: string | null): boolean =>
  !!category && SHOE_CATEGORIES.has(category.trim().toLowerCase())

export const SKU_PAGE_SIZE = 100 // the API maximum

export interface SkuPage {
  items: CatalogItem[]
  /** Offset of the next page, or null when this page was the last one */
  nextOffset: number | null
}

export const fetchSkuPage = async (offset: number): Promise<SkuPage> => {
  const url = new URL(demoConfig.skuItemsUrl)
  url.searchParams.set('limit', String(SKU_PAGE_SIZE))
  url.searchParams.set('offset', String(offset))

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`sku_items request failed: ${response.status}`)

  const data = (await response.json()) as SkuItemsListResponse

  // Only items whose try-on capability is enabled and actually ready
  const items = (data.items ?? [])
    .filter(
      (item) =>
        item.capabilities?.try_on === true &&
        item.capabilities_readiness?.try_on?.status === 'ready',
    )
    .map((item) => {
      const extra = item.product_info?.extra ?? {}
      const metadata = item.metadata ?? {}
      // Resolved PER FIELD: `metadata` (the current home of these attributes)
      // wins whenever it carries the key at all — even false/0 — and only a
      // missing key falls back to the legacy `product_info.extra`.
      const titleImage = metadata.title_image ?? extra.title_image
      const sourceImages = metadata.source_images ?? extra.source_images
      const order = metadata.order ?? extra.order
      const singleItemTryOn = metadata.single_item_try_on ?? extra.single_item_try_on
      return {
        sku_id: item.sku_id,
        title: item.product_info?.title ?? item.sku_id,
        brand: item.product_info?.brand ?? undefined,
        gender: item.product_info?.gender ?? undefined,
        // Image priority: title_image | source_images[0] | image_urls[0]
        image_url: titleImage || sourceImages?.[0] || item.product_info?.image_urls?.[0] || '',
        mode: isShoeCategory(item.product_info?.category)
          ? ('shoes' as const)
          : ('general' as const),
        order: typeof order === 'number' ? order : Number.MAX_SAFE_INTEGER,
        singleItemTryOn: singleItemTryOn === true,
      }
    })

  return { items, nextOffset: data.next_offset ?? null }
}

export const fetchOutfits = async (): Promise<OutfitsApiResponse[]> => {
  const url = new URL(demoConfig.outfitsUrl)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`suggested_outfits request failed: ${response.status}`)

  const data = (await response.json()) as OutfitsApiResponse[]
  return data ?? []
}

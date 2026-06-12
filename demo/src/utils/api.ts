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

export const fetchSkuList = async (): Promise<CatalogItem[]> => {
  const url = new URL(demoConfig.skuItemsUrl)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`sku_items request failed: ${response.status}`)

  const data = (await response.json()) as SkuItemsListResponse

  // Only items whose try-on capability is enabled and actually ready
  return (data.items ?? [])
    .filter(
      (item) =>
        item.capabilities?.try_on === true &&
        item.capabilities_readiness?.try_on?.status === 'ready',
    )
    .map((item) => ({
      sku_id: item.sku_id,
      title: item.product_info?.title ?? item.sku_id,
      brand: item.product_info?.brand ?? undefined,
      image_url: item.product_info?.image_urls?.[0] ?? '',
      mode: isShoeCategory(item.product_info?.category) ? ('shoes' as const) : ('general' as const),
    }))
}

export const fetchOutfits = async (): Promise<OutfitsApiResponse[]> => {
  const url = new URL(demoConfig.outfitsUrl)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`suggested_outfits request failed: ${response.status}`)

  const data = (await response.json()) as OutfitsApiResponse[]
  return data ?? []
}

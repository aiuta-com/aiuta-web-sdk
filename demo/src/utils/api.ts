import { demoConfig } from './config'
import type {
  CatalogItem,
  Outfit,
  OutfitItemView,
  SkuItem,
  SkuItemsListResponse,
} from '../models/product'

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

export const SKU_PAGE_SIZE = 400 // outfits reference hidden items too — pull the whole catalog fast

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
        // The title/brand/gender overrides are metadata-only (never in the
        // legacy extra). An empty title override falls back to product_info
        // (||); an empty BRAND override is a real value — the card then
        // deliberately shows no brand (hence ??).
        title: metadata.title || item.product_info?.title || item.sku_id,
        brand: metadata.brand ?? item.product_info?.brand ?? undefined,
        gender: metadata.gender || item.product_info?.gender || undefined,
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

/** Raw entries — the endpoint has shipped three shapes over time, so the
 *  demo never trusts the payload's type: see normalizeOutfits below. */
export const fetchOutfits = async (): Promise<unknown[]> => {
  // No query params — the endpoint supports none (a limit here was cargo-cult).
  const response = await fetch(demoConfig.outfitsUrl, { headers: headers() })
  if (!response.ok) throw new Error(`suggested_outfits request failed: ${response.status}`)

  const data = (await response.json()) as unknown[]
  return Array.isArray(data) ? data : []
}

// ------------------------------------------- Outfit response normalizer ---
// Two /suggested_outfits shapes are live:
//   1. legacy: { items: SkuItem[], collage_image_url, tags }
//   2. admin:  { sku_ids, metadata: { title?, title_image?, gender?,
//                occasion?, style?, order?, multi_item_try_on? } }
// The admin shape carries only ids — items resolve through the sku_items
// catalog (which includes single_item_try_on:false items: hidden from the
// single-items grid, but legal inside outfits).

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

// The outfits API serializes missing images as a URL ending in "None"
// (Python None stringified); bare filenames have no resolvable base — only
// an absolute http(s) URL is renderable.
const usableUrl = (v: unknown): string | undefined =>
  typeof v === 'string' && /^https?:\/\//i.test(v) && !/\/None$/i.test(v) ? v : undefined

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' && v !== '' ? v : undefined

// A view for EVERY id — unresolved ones keep an empty imageUrl and render
// as placeholder tiles until the catalog page carrying them arrives, so the
// grid layout is final from the first paint and images just pop in.
const resolveItems = (skuIds: string[], catalog: Map<string, CatalogItem>): OutfitItemView[] =>
  skuIds.map((skuId) => {
    const item = catalog.get(skuId)
    return item ? { skuId, imageUrl: item.image_url, title: item.title } : { skuId, imageUrl: '' }
  })

const normalizeOutfit = (
  entry: unknown,
  index: number,
  catalog: Map<string, CatalogItem>,
): Outfit | null => {
  if (!isRecord(entry)) return null

  // Format 1 — legacy embedded items.
  if (Array.isArray(entry.items)) {
    const items = entry.items as SkuItem[]
    const tags = isRecord(entry.tags) ? entry.tags : {}
    return {
      skuIds: items.map((i) => i.sku_id),
      items: items.map((i) => ({
        skuId: i.sku_id,
        imageUrl: usableUrl(i.descriptive_image_urls?.[0]) ?? usableUrl(i.image_urls?.[0]) ?? '',
        title: i.title,
      })),
      collageUrl: usableUrl(entry.collage_image_url),
      gender: asString(tags.gender),
      occasion: asString(tags.occasion),
      style: asString(tags.style),
      order: index,
      multiItemTryOn: true,
    }
  }

  if (!Array.isArray(entry.sku_ids)) return null
  const skuIds = entry.sku_ids.filter((id): id is string => typeof id === 'string' && id !== '')
  const metadata = isRecord(entry.metadata) ? entry.metadata : {}

  // Format 2 — the admin panel's metadata: flat tags, explicit availability
  // (kept even when not flagged — the gear menu's outfits filter decides).
  return {
    skuIds,
    items: resolveItems(skuIds, catalog),
    collageUrl: usableUrl(metadata.title_image),
    title: asString(metadata.title),
    gender: asString(metadata.gender),
    occasion: asString(metadata.occasion),
    style: asString(metadata.style),
    multiItemTryOn: metadata.multi_item_try_on === true,
    order: typeof metadata.order === 'number' ? metadata.order : index,
  }
}

/** Fold whatever /suggested_outfits returned into the demo's `Outfit` shape.
 *  A malformed entry is skipped, never the whole list — one bad outfit must
 *  not blank the tab again. */
export const normalizeOutfits = (raw: unknown[], catalog: Map<string, CatalogItem>): Outfit[] => {
  const outfits: Outfit[] = []
  raw.forEach((entry, index) => {
    try {
      const outfit = normalizeOutfit(entry, index, catalog)
      if (outfit && outfit.skuIds.length > 0) outfits.push(outfit)
    } catch (error) {
      console.error('Skipping a malformed outfit entry', error)
    }
  })
  outfits.sort((a, b) => a.order - b.order)
  // With no title and no style a card would read just "Outfit" (occasion
  // lives in the subtitle) — number the nameless ones by their position in
  // the final list, so several of them stay distinguishable ("Outfit 3").
  outfits.forEach((outfit, position) => {
    if (!outfit.title && !outfit.style) outfit.title = `Outfit ${position + 1}`
  })
  return outfits
}

// ------------------------------------------------- Unified API catalog ---

export type SkuCapabilityReadinessStatus = 'absent' | 'preparing' | 'ready' | 'rejected' | 'failed'

/** Merchant-defined free-form fields the demo understands; live in the
 *  top-level `metadata`. */
export interface SkuItemMetadata {
  /** Catalog sort key: the smaller, the earlier in the list */
  order?: number | null
  /** Whether to show the item in the single-item try-on list at all */
  single_item_try_on?: boolean | null
  /** The main SKU image to show in the demo UI */
  title_image?: string | null
  /** All source SKU images (internal, for the mobile demo app) */
  source_images?: string[] | null
  /** Overrides of the immutable product_info fields. Absent = fall back to
   *  product_info. `brand: ''` is a real value — the item deliberately shows
   *  no brand; an empty title falls back instead. */
  title?: string | null
  brand?: string | null
  gender?: string | null
  /** Whether the item offers the Size & Fit flow in the demo */
  size_fit?: boolean | null
  /** Size-chart code the Size & Fit survey is submitted against */
  size_chart?: string | null
  /** naiz.fit credentials the SDK calls the recommendation API with */
  size_fit_api_key?: string | null
  size_fit_partition?: string | null
}

export interface UnifiedSkuItem {
  internal_id: string
  sku_id: string
  created_at: string
  product_info: {
    title?: string | null
    description?: string | null
    brand?: string | null
    category?: string | null
    gender?: string | null
    image_urls?: string[] | null
    store_url?: string | null
  }
  metadata?: SkuItemMetadata | null
  capabilities: {
    try_on?: boolean
    outfit_recommendations?: boolean
    size_and_fit?: boolean
  }
  capabilities_readiness: {
    try_on?: { status: SkuCapabilityReadinessStatus }
    outfit_recommendations?: { status: SkuCapabilityReadinessStatus }
    size_and_fit?: { status: SkuCapabilityReadinessStatus }
  }
}

export interface SkuItemsListResponse {
  items: UnifiedSkuItem[]
  total: number
  next_offset?: number | null
}

/** Simplified display model the demo catalog actually renders */
export interface CatalogItem {
  sku_id: string
  title: string
  brand?: string
  image_url: string
  /** Product gender (e.g. "male" / "female"), used to preselect the model category */
  gender?: string
  /** Try-on mode derived from the backend category (shoes vs everything else) */
  mode: 'general' | 'shoes'
  /** Sort key from extra.order; items without one go last */
  order: number
  /** Explicitly flagged extra.single_item_try_on: true (gear-menu filter) */
  singleItemTryOn: boolean
  /** Explicitly flagged metadata.size_fit: true */
  sizeFit: boolean
  /** Size-chart code from metadata.size_chart (present when sizeFit is on) */
  sizeChart?: string
  /** naiz.fit credentials from metadata */
  sizeFitApiKey?: string
  sizeFitPartition?: string
}

// ------------------------------------------------------------- Outfits ---
// The suggested_outfits endpoint has two live shapes (the legacy
// embedded-items one and the admin-panel metadata one) — the demo normalizes
// whatever arrives into `Outfit` (see normalizeOutfits in utils/api.ts) and
// renders only that.

/** One resolved item of an outfit, ready for the card grid. */
export interface OutfitItemView {
  skuId: string
  imageUrl: string
  title?: string
}

/** The demo's own outfit shape — every response format folds into this. */
export interface Outfit {
  /** Ordered composition; ALL ids go to tryOn even when not resolved. */
  skuIds: string[]
  /** One view per sku id; unresolved ids carry an empty imageUrl and render
   *  as placeholder tiles until the catalog page carrying them arrives. */
  items: OutfitItemView[]
  /** Absolute http(s) URL only; absent → the item grid renders instead. */
  collageUrl?: string
  /** Explicit title when the format provides one; tags are the fallback. */
  title?: string
  gender?: string
  occasion?: string
  style?: string
  /** position / order / array index — the list is sorted by it. */
  order: number
  /** Whether the REAL demo page would list it (admin shape:
   *  metadata.multi_item_try_on === true; legacy shape: always). The test
   *  page shows everything unless the gear-menu outfits filter is on. */
  multiItemTryOn: boolean
}

export interface OutfitTags {
  gender?: string
  /** Human-readable occasion, used as the card title (e.g. "Office Hours") */
  occasion?: string
  style?: string
}

export interface OutfitsApiResponse {
  items: SkuItem[]
  collage_image_url: string
  tags: OutfitTags
}

export interface SkuItem {
  id: string
  sku_id: string
  brand?: string
  sku_catalog_name: string
  description: string
  title: string
  category_google_id: string
  category_google_name: string
  color: string
  gender: 'male' | 'female'
  age_group: 'adult'
  image_urls: string[]
  descriptive_image_urls: string[]
  try_on_examples: string[]
  is_ready: boolean
  store_url: string
  generation_quality: number
  toloka_score: number
}

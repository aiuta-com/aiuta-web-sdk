// ------------------------------------------------- Unified API catalog ---

export type SkuCapabilityReadinessStatus = 'absent' | 'preparing' | 'ready' | 'rejected' | 'failed'

/** Merchant-defined free-form fields the demo understands */
export interface SkuItemExtra {
  /** Catalog sort key: the smaller, the earlier in the list */
  order?: number | null
  /** Whether to show the item in the single-item try-on list at all */
  single_item_try_on?: boolean | null
  /** The main SKU image to show in the demo UI */
  title_image?: string | null
  /** All source SKU images (internal, for the mobile demo app) */
  source_images?: string[] | null
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
    extra?: SkuItemExtra | null
  }
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
}

// ------------------------------------------------------------- Outfits ---
// The suggested_outfits endpoint still returns items in the legacy SkuItem
// shape (with descriptive_image_urls) — see the OpenAPI spec

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

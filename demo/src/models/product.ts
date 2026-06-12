// ------------------------------------------------- Unified API catalog ---

export type SkuCapabilityReadinessStatus = 'absent' | 'preparing' | 'ready' | 'rejected' | 'failed'

export interface UnifiedSkuItem {
  internal_id: string
  sku_id: string
  created_at: string
  product_info: {
    title?: string | null
    description?: string | null
    brand?: string | null
    category?: string | null
    image_urls?: string[] | null
    store_url?: string | null
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
  /** Try-on mode derived from the backend category (shoes vs everything else) */
  mode: 'general' | 'shoes'
}

// ------------------------------------------------------------- Outfits ---
// The suggested_outfits endpoint still returns items in the legacy SkuItem
// shape (with descriptive_image_urls) — see the OpenAPI spec

export interface OutfitsApiResponse {
  items: SkuItem[]
  model_image_url: string
  collage_image_url: string
  title: string
  style: string
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

export interface ProductsApiResponse {
  result: SkuItem[]
  before: string
  after: string
  errors: unknown[]
}

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

import { demoConfig } from './config'
import type { OutfitsApiResponse, ProductsApiResponse, SkuItem } from '../models/product'

const headers = (): HeadersInit => ({ 'x-api-key': demoConfig.apiKey })

export const fetchSkuList = async (): Promise<SkuItem[]> => {
  const url = new URL(demoConfig.skuItemsUrl)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`sku_items request failed: ${response.status}`)

  const data = (await response.json()) as ProductsApiResponse
  return data.result ?? []
}

export const fetchOutfits = async (): Promise<OutfitsApiResponse[]> => {
  const url = new URL(demoConfig.outfitsUrl)
  url.searchParams.set('limit', '100')

  const response = await fetch(url.toString(), { headers: headers() })
  if (!response.ok) throw new Error(`suggested_outfits request failed: ${response.status}`)

  const data = (await response.json()) as OutfitsApiResponse[]
  return data ?? []
}

/**
 * Demo page runtime configuration.
 *
 * The demo is bound to a specific SDK release: in the built artifact it loads
 * the sibling `./index.umd.js`, so the catalog endpoints and the public demo
 * key mirror the marketing demo (demo.aiuta.com) — just without the marketing
 * forms. The API key can be overridden via `?code=<key>` to preview a partner
 * catalog.
 */

const DEMO_API_KEY = 'AIUTADEMO'

const params = new URLSearchParams(window.location.search)

export const demoConfig = {
  apiKey: params.get('code')?.trim() || DEMO_API_KEY,
  skuItemsUrl: 'https://api.aiuta.com/digital-try-on/v1/sku_items',
  outfitsUrl: 'https://api.aiuta.com/digital-try-on/v1/suggested_outfits',
}

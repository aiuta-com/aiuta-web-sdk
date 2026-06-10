/**
 * Demo page runtime configuration.
 *
 * The catalog endpoints follow the build's environment (`__TRY_ON_API_URL__` is
 * baked per build mode in vite.config.demo.ts), so a dev/preprod build talks to
 * the matching API and stays consistent with the SDK's try-on backend. The
 * public demo key can be overridden via `?code=<key>` to preview a partner
 * catalog.
 */

declare const __TRY_ON_API_URL__: string

const DEMO_API_KEY = 'AIUTADEMO'

const params = new URLSearchParams(window.location.search)

export const demoConfig = {
  apiKey: params.get('code')?.trim() || DEMO_API_KEY,
  skuItemsUrl: `${__TRY_ON_API_URL__}/sku_items`,
  outfitsUrl: `${__TRY_ON_API_URL__}/suggested_outfits`,
}

import { defineConfig } from 'vite'
import path from 'path'
import pkg from './package.json'

const fullVersion = pkg.version
const majorVersion = fullVersion.split('.')[0]

const DEFAULT_BRANCH = 'main'
const ANALYTICS_PATH = 'analytics/v1/web-sdk-analytics'

const API_DOMAIN_DEV = 'api.dev.aiuta.com'
const API_DOMAIN_PREPROD = 'api.preprod.aiuta.com'
const API_DOMAIN_PROD = 'api.aiuta.com'

const STATIC_DOMAIN_DEV = 'static.dev.aiuta.com'
const STATIC_DOMAIN_PREPROD = 'static.preprod.aiuta.com'
const STATIC_DOMAIN_PROD = 'static.aiuta.com'

const SDK_PATH = 'sdk'
const INDEX_FILE = 'index.html'

const buildUrl = (...parts: string[]): string => `https://${parts.join('/')}`

export default defineConfig(({ mode }) => {
  let iframeUrl: string
  let analyticsUrl: string

  switch (mode) {
    case 'debug':
      iframeUrl = `/iframe/${INDEX_FILE}`
      analyticsUrl = buildUrl(API_DOMAIN_DEV, ANALYTICS_PATH)
      break
    case 'dev':
      const branch = process.env.AIUTA_IFRAME_BRANCH || DEFAULT_BRANCH
      iframeUrl = buildUrl(STATIC_DOMAIN_DEV, SDK_PATH, branch, INDEX_FILE)
      analyticsUrl = buildUrl(API_DOMAIN_DEV, ANALYTICS_PATH)
      break
    case 'preprod':
      iframeUrl = buildUrl(STATIC_DOMAIN_PREPROD, SDK_PATH, DEFAULT_BRANCH, INDEX_FILE)
      analyticsUrl = buildUrl(API_DOMAIN_PREPROD, ANALYTICS_PATH)
      break
    case 'strict':
      iframeUrl = buildUrl(STATIC_DOMAIN_PROD, SDK_PATH, `v${fullVersion}`, INDEX_FILE)
      analyticsUrl = buildUrl(API_DOMAIN_PROD, ANALYTICS_PATH)
      break
    default:
      iframeUrl = buildUrl(STATIC_DOMAIN_PROD, SDK_PATH, `v${majorVersion}`, INDEX_FILE)
      analyticsUrl = buildUrl(API_DOMAIN_PROD, ANALYTICS_PATH)
      break
  }

  return {
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'shared/'),
      },
    },
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
      __AIUTA_IFRAME_URL__: JSON.stringify(iframeUrl),
      __AIUTA_ANALYTICS_URL__: JSON.stringify(analyticsUrl),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'web-sdk/index.ts'),
        name: 'Aiuta',
        formats: ['umd', 'es', 'cjs'],
        fileName: (format) => `index.${format}.js`,
      },
      outDir: path.resolve(__dirname, `dist/${SDK_PATH}`),
      emptyOutDir: false,
      rollupOptions: {
        output: {
          globals: {},
        },
      },
    },
  }
})

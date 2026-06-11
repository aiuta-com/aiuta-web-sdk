import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { viteSingleFile } from 'vite-plugin-singlefile'
import fs from 'fs'
import path from 'path'
import pkg from './package.json'
import { buildConfig, getEnvironmentUrls } from './vite.config.shared'
import { generateScopedName } from './vite.config.bem'

const DEMO_DIR = 'demo'
const APP_DEV_SERVER = 'http://localhost:9875/'

// Backend environment the build targets, by mode. `debug` (local) and the
// default production build both hit prod APIs; only dev/preprod builds differ.
const ENV_BY_MODE: Record<string, 'dev' | 'preprod' | 'prod'> = {
  dev: 'dev',
  preprod: 'preprod',
}

export default defineConfig(({ command, mode }) => {
  const isDevServer = command === 'serve'
  const { analyticsUrl, tryOnApiUrl } = getEnvironmentUrls(mode)
  const demoEnv = ENV_BY_MODE[mode] ?? 'prod'

  const outDir = path.resolve(__dirname, buildConfig.path.dist, buildConfig.path.sdk)

  return {
    plugins: [
      react(),
      tsconfigPaths(),
      // In the built artifact the version-locked SDK is loaded from the sibling
      // file; in dev the SDK comes from source (see demo/src/sdk.ts).
      {
        name: 'demo-inject-umd',
        transformIndexHtml(html: string) {
          if (isDevServer) return html
          return html.replace('</head>', '  <script src="./index.umd.js"></script>\n  </head>')
        },
      },
      // Inline JS/CSS into a single self-contained demo.html (no assets/ dir, so
      // nothing collides with dist/app/assets/ at the shared deploy path).
      ...(isDevServer ? [] : [viteSingleFile()]),
      // Emit as demo.html, not index.html — index.html would overwrite the SDK
      // app entry when dist/sdk and dist/app are uploaded to the same path.
      {
        name: 'demo-emit-as-demo-html',
        apply: 'build' as const,
        closeBundle() {
          const from = path.join(outDir, buildConfig.path.index)
          const to = path.join(outDir, 'demo.html')
          if (fs.existsSync(from)) fs.renameSync(from, to)
        },
      },
    ],
    base: './',
    root: path.resolve(__dirname, DEMO_DIR),
    // Separate dep-prebundle cache from the app dev server (vite.config.app.ts).
    // Both share this package.json, so without this they fight over
    // node_modules/.vite/deps and the app iframe gets 504 "Outdated Optimize Dep".
    cacheDir: path.resolve(__dirname, 'node_modules/.vite-demo'),
    server: {
      host: '0.0.0.0',
      port: 9876,
      strictPort: true,
      allowedHosts: ['localhost', '.local'],
      cors: true,
    },
    resolve: {
      alias: {
        '@sdk': path.resolve(__dirname, buildConfig.path.sdk),
        '@lib': path.resolve(__dirname, buildConfig.path.lib),
        '@': path.resolve(__dirname, buildConfig.path.app, buildConfig.path.src),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      dedupe: ['react', 'react-dom'],
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName,
      },
    },
    esbuild: {
      jsx: 'automatic',
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isDevServer ? 'development' : 'production'),
      __SDK_VERSION__: JSON.stringify(pkg.version),
      __APP_VERSION__: JSON.stringify(pkg.version),
      // Catalog API base + env follow the build mode (debug/local → prod).
      __TRY_ON_API_URL__: JSON.stringify(tryOnApiUrl),
      __DEMO_ENV__: JSON.stringify(demoEnv),
      // Only consumed in dev, where the SDK source is bundled and reads these.
      __APP_URL__: JSON.stringify(isDevServer ? APP_DEV_SERVER : getEnvironmentUrls('prod').appUrl),
      __ANALYTICS_URL__: JSON.stringify(analyticsUrl),
    },
    build: {
      outDir,
      emptyOutDir: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          demo: path.resolve(__dirname, DEMO_DIR, buildConfig.path.index),
        },
      },
    },
  }
})

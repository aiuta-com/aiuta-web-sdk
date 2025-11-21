import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
import { buildConfig, getEnvironmentUrls } from './vite.config.shared'
import { generateScopedName } from './vite.config.bem'

export default defineConfig(({ mode }) => {
  const { tryOnApiUrl, qrApiUrl } = getEnvironmentUrls(mode)

  return {
    plugins: [react(), tsconfigPaths()],
    base: './',
    root: path.resolve(__dirname, buildConfig.path.app),
    build: {
      outDir: path.resolve(__dirname, buildConfig.path.dist, buildConfig.path.app),
      emptyOutDir: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, buildConfig.path.app, buildConfig.path.index),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, buildConfig.path.app, buildConfig.path.src),
        '@lib': path.resolve(__dirname, buildConfig.path.lib),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
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
      'process.env.NODE_ENV': JSON.stringify('production'),
      __APP_VERSION__: JSON.stringify(pkg.version),
      __TRY_ON_API_URL__: JSON.stringify(tryOnApiUrl),
      __QR_API_URL__: JSON.stringify(qrApiUrl),
    },
  }
})

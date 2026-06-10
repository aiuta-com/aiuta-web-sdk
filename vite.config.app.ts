import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
import { buildConfig, getEnvironmentUrls } from './vite.config.shared'
import { generateScopedName } from './vite.config.bem'

export default defineConfig(({ mode, command }) => {
  const { tryOnApiUrl, qrApiUrl } = getEnvironmentUrls(mode)

  // Use absolute paths for dev server (HMR), relative paths for builds
  const isDevServer = command === 'serve'

  return {
    plugins: [react(), tsconfigPaths()],
    base: isDevServer ? '/' : './',
    root: path.resolve(__dirname, buildConfig.path.app),
    server: {
      host: '0.0.0.0',
      port: 9875,
      strictPort: true,
      allowedHosts: ['localhost', '.local'],
      // Allow the SDK's cross-origin availability check (HEAD) from the demo
      // origin, incl. .local / LAN hosts when testing from another device.
      cors: true,
    },
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
      // Force a single React instance (dev-server safety, no effect on a single install).
      dedupe: ['react', 'react-dom'],
    },
    // Pre-bundle all runtime deps up front so the dep optimizer doesn't re-run
    // and bump hashes after the app loads (e.g. inside the SDK iframe), which
    // produces "Outdated Optimize Dep" 504s and duplicate-React hook errors.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-redux',
        '@reduxjs/toolkit',
        'react-router-dom',
        '@tanstack/react-query',
        'next-qrcode',
      ],
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

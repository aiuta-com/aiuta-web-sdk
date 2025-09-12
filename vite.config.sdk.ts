import { defineConfig } from 'vite'
import path from 'path'
import pkg from './package.json'
import { getEnvironmentUrls, buildConfig } from './vite.config.shared'

export default defineConfig(({ mode }) => {
  const { appUrl, analyticsUrl } = getEnvironmentUrls(mode, pkg.version)

  return {
    resolve: {
      alias: {
        '@lib': path.resolve(__dirname, buildConfig.path.lib),
      },
    },
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
      __APP_URL__: JSON.stringify(appUrl),
      __ANALYTICS_URL__: JSON.stringify(analyticsUrl),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, buildConfig.path.sdk, 'index.ts'),
        name: 'Aiuta',
        formats: ['umd', 'es', 'cjs'],
        fileName: (format) => `index.${format}.js`,
      },
      outDir: path.resolve(__dirname, buildConfig.path.dist, buildConfig.path.sdk),
      emptyOutDir: false,
      rollupOptions: {
        output: {
          globals: {},
        },
      },
    },
  }
})

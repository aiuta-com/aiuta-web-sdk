import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
import { buildConfig } from './vite.config.shared'
import { generateScopedName } from './vite.config.bem'
import fs from 'fs'
import { minify } from 'html-minifier-terser'

// Plugin to fix bootstrap hash and minify HTML after build
const bootstrapPostprocessPlugin = () => {
  return {
    name: 'bootstrap-postprocess',
    async closeBundle() {
      // Post-process bootstrap HTML after build is complete
      const bootstrapPath = path.resolve(
        __dirname,
        buildConfig.path.dist,
        buildConfig.path.app,
        buildConfig.path.bootstrap,
        buildConfig.file.index,
      )
      const assetsDir = path.resolve(
        __dirname,
        buildConfig.path.dist,
        buildConfig.path.app,
        buildConfig.path.assets,
      )

      if (!fs.existsSync(bootstrapPath)) return

      // Find main JS and CSS files
      const assetFiles = fs.readdirSync(assetsDir)
      const mainJsFile = assetFiles.find(
        (file) =>
          file.startsWith(`${buildConfig.entry.main}-`) && file.endsWith(buildConfig.ext.js),
      )
      const mainCssFile = assetFiles.find(
        (file) =>
          file.startsWith(`${buildConfig.entry.main}-`) && file.endsWith(buildConfig.ext.css),
      )

      if (!mainJsFile || !mainCssFile) return

      // Replace placeholders in bootstrap HTML
      let bootstrapContent = fs.readFileSync(bootstrapPath, 'utf-8')
      bootstrapContent = bootstrapContent.replace(
        `${buildConfig.path.assets}/${buildConfig.entry.main}-${buildConfig.placeholder.mainHash}${buildConfig.ext.js}`,
        `${buildConfig.path.assets}/${mainJsFile}`,
      )
      bootstrapContent = bootstrapContent.replace(
        `${buildConfig.path.assets}/${buildConfig.entry.main}-${buildConfig.placeholder.mainHash}${buildConfig.ext.css}`,
        `${buildConfig.path.assets}/${mainCssFile}`,
      )

      // Minify HTML with html-minifier-terser
      const minifiedHtml = await minify(bootstrapContent, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
        removeAttributeQuotes: true,
        removeOptionalTags: false,
        sortAttributes: true,
        sortClassName: true,
      })

      fs.writeFileSync(bootstrapPath, minifiedHtml)
      console.log(`✓ Bootstrap fixed and minified: ${mainJsFile}, ${mainCssFile}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tsconfigPaths(), bootstrapPostprocessPlugin()],
  base: './',
  root: path.resolve(__dirname, buildConfig.path.app),
  build: {
    outDir: path.resolve(__dirname, buildConfig.path.dist, buildConfig.path.app),
    emptyOutDir: true,
    chunkSizeWarningLimit: 512,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        // Main app entry
        main: path.resolve(__dirname, buildConfig.path.app, buildConfig.file.index),
        // Bootstrap entry
        bootstrap: path.resolve(
          __dirname,
          buildConfig.path.app,
          buildConfig.path.bootstrap,
          buildConfig.file.index,
        ),
      },
      output: {
        // Ensure bootstrap gets its own directory
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === buildConfig.entry.bootstrap) {
            return `${buildConfig.path.bootstrap}/${buildConfig.file.indexJs}`
          }
          return `${buildConfig.path.assets}/${buildConfig.pattern.nameHashJs}`
        },
        assetFileNames: (assetInfo) => {
          // Bootstrap HTML should go to bootstrap/ directory
          if (assetInfo.names?.[0] === `${buildConfig.entry.bootstrap}${buildConfig.ext.html}`) {
            return `${buildConfig.path.bootstrap}/${buildConfig.file.index}`
          }
          return `${buildConfig.path.assets}/${buildConfig.pattern.nameHashExt}`
        },
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
  },
})

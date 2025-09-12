import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
import { buildConfig, camelToKebab } from './vite.config.shared'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
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
      input: path.resolve(__dirname, buildConfig.path.app, buildConfig.file.index),
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
      generateScopedName: (name, filename) => {
        const componentMatch = filename.match(/([^/]+)\.module\.(css|scss)$/)
        const componentName = componentMatch ? componentMatch[1] : 'component'

        const kebabComponent = camelToKebab(componentName)
        const kebabClassName = camelToKebab(name)

        // If class name matches component name (main block), return just the block
        if (kebabClassName === kebabComponent) {
          return `aiuta-${kebabComponent}`
        }

        // Check if this is a modifier of the main component
        // e.g., errorSnackbarActive -> errorSnackbar + Active
        // Convert component name to camelCase (ErrorSnackbar -> errorSnackbar)
        const componentCamelCase = componentName.charAt(0).toLowerCase() + componentName.slice(1)
        const componentModifierPattern = new RegExp(`^${componentCamelCase}([A-Z].*)$`)
        const componentModifierMatch = name.match(componentModifierPattern)

        if (componentModifierMatch) {
          const modifier = componentModifierMatch[1]
          const kebabModifier = camelToKebab(modifier)
          return `aiuta-${kebabComponent}--${kebabModifier}`
        }

        // Check if this is a modifier of some element
        // e.g., containerActive -> container + Active
        const modifierPattern = /^([a-z]+)([A-Z].*)$/
        const modifierMatch = name.match(modifierPattern)

        if (modifierMatch) {
          const baseClass = modifierMatch[1]
          const modifier = modifierMatch[2]
          const kebabModifier = camelToKebab(modifier)

          return `aiuta-${kebabComponent}__${baseClass}--${kebabModifier}`
        }

        // Regular element
        return `aiuta-${kebabComponent}__${kebabClassName}`
      },
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

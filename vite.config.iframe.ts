import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: './',
  root: path.resolve(__dirname, 'iframe-content'),
  build: {
    outDir: path.resolve(__dirname, 'dist/iframe'),
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: path.resolve(__dirname, 'iframe-content/index.html'),
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'iframe-content/src/'),
      '@lib': path.resolve(__dirname, 'iframe-content/lib/'),
      '@shared': path.resolve(__dirname, 'shared/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: (name, filename) => {
        // Extract component name from filename
        const componentMatch = filename.match(/([^/]+)\.module\.(css|scss)$/)
        const componentName = componentMatch ? componentMatch[1] : 'component'

        // Convert camelCase to kebab-case for both component and class names
        const kebabComponent = componentName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '') // Remove leading dash
        const kebabClassName = name
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()
          .replace(/^-/, '') // Remove leading dash

        // Generate predictable class name: aiuta-{component}__{class} (proper BEM)
        return `aiuta-${kebabComponent}__${kebabClassName}`
      },
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __IFRAME_VERSION__: JSON.stringify(pkg.version),
  },
})

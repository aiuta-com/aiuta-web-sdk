import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'web-sdk/index.ts'),
      name: 'Aiuta',
      formats: ['umd', 'es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    outDir: path.resolve(__dirname, 'dist/sdk'),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: "./",
  root: path.resolve(__dirname, "iframe-content"),
  build: {
    outDir: path.resolve(__dirname, "dist/iframe"),
    emptyOutDir: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: path.resolve(__dirname, "iframe-content/index.html"),
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "iframe-content/src/"),
      "@lib": path.resolve(__dirname, "iframe-content/lib/"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

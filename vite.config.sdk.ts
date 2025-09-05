import { defineConfig } from "vite";
import path from "path";
import pkg from "./package.json";

export default defineConfig(({ mode }) => {
  let iframeUrl: string;
  let analyticsUrl: string;

  switch (mode) {
    case "debug":
      iframeUrl = "/iframe/index.html";
      analyticsUrl = "https://api.dev.aiuta.com/analytics/v1/web-sdk-analytics";
      break;
    case "dev":
      const branch = process.env.AIUTA_IFRAME_BRANCH || "v0";
      iframeUrl = `https://static.dev.aiuta.com/sdk/${branch}/index.html`;
      analyticsUrl = "https://api.dev.aiuta.com/analytics/v1/web-sdk-analytics";
      break;
    case "preprod":
      iframeUrl = "https://static.preprod.aiuta.com/sdk/main/index.html";
      analyticsUrl =
        "https://api.preprod.aiuta.com/analytics/v1/web-sdk-analytics";
      break;
    default:
      iframeUrl = "https://static.aiuta.com/sdk/v0/index.html";
      analyticsUrl = "https://api.aiuta.com/analytics/v1/web-sdk-analytics";
      break;
  }

  return {
    define: {
      __SDK_VERSION__: JSON.stringify(pkg.version),
      __AIUTA_IFRAME_URL__: JSON.stringify(iframeUrl),
      __AIUTA_ANALYTICS_URL__: JSON.stringify(analyticsUrl),
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, "web-sdk/index.ts"),
        name: "Aiuta",
        formats: ["umd", "es", "cjs"],
        fileName: (format) => `index.${format}.js`,
      },
      outDir: path.resolve(__dirname, "dist/sdk"),
      emptyOutDir: false,
      rollupOptions: {
        output: {
          globals: {},
        },
      },
    },
  };
});

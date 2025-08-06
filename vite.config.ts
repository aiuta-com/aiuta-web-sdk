import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: {
        main: path.resolve(__dirname, "src/index.ts"),
        webSdkButtonAction: path.resolve(
          __dirname,
          "src/webSdkButtonAction.ts"
        ),
        webSdkButtonStyles: path.resolve(
          __dirname,
          "src/webSdkButtonStyles.ts"
        ),
      },
      fileName: (format, entryName) => `index.${entryName}.${format}.js`,
      formats: ["es"],
    },
  },
});

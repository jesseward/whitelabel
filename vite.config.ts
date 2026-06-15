import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "./", // Use relative paths for assets to support subdirectory deployment (e.g. GitHub Pages)
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "vendor-ui",
              test: /node_modules[\\/](?:framer-motion|@dnd-kit)/,
            },
            {
              name: "vendor-konva",
              test: /node_modules[\\/](?:(?:react-)?konva|use-image)/,
            },
            {
              name: "vendor-utils",
              test: /node_modules[\\/](?:piexifjs|p-throttle|idb-keyval|zustand)/,
            },
          ],
        },
      },
    },
  },
});

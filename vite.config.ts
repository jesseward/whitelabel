import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Use relative paths for assets to support subdirectory deployment (e.g. GitHub Pages)
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-ui': ['framer-motion', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-konva': ['konva', 'react-konva', 'use-image'],
          'vendor-utils': ['piexifjs', 'p-throttle', 'idb-keyval', 'zustand']
        }
      }
    }
  }
})

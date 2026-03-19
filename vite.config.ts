import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import checker from 'vite-plugin-checker'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom'
  },
  plugins: [
    vue(),
    tailwindcss(),
    checker({
      vueTsc: true
    }),
  ],
})

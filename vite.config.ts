import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  cacheDir: "./src/.vite-cache",
  plugins: [react()],
  base: "/pitch/",
})

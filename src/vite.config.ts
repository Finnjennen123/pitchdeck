import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, '..'), // Set root back to project root since config is in src
  cacheDir: "./src/.vite-cache",
  plugins: [react()],
  base: "/pitch/",
})
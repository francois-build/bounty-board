
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import postcss from './postcss.config.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss,
  },
  resolve: {
    alias: {
      '@bridge/shared': path.resolve(__dirname, '../../packages/shared'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})

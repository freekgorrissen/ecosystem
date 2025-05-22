import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "https://freekgorrissen.github.io/ecosystem/",
  resolve: {
    alias: {
      '~bootstrap': path.resolve(process.cwd(), 'node_modules/bootstrap'),
      '~bootstrap-icons': path.resolve(process.cwd(), 'node_modules/bootstrap-icons'),
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Treat the top-level `assets/` folder as Vite's public directory so
  // files referenced as `/assets/...` are copied into the build output.
  publicDir: 'assets',
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Set base from env when deploying to GitHub Pages (e.g., /REPO-NAME/).
// Fallback to '/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base
})

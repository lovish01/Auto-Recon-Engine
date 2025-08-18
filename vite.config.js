import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'Auto-Recon-Engine'  // <-- change this if your repo name is different
const username = 'lovish01'      // <-- change this to your GitHub username

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,   // Important for GitHub Pages
  build: {
    outDir: 'dist'
  }
})

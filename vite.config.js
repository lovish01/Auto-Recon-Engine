import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚡ change repoName to your actual repo name
const repoName = 'Auto-Recon-Engine'  

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,  // 👈 this is the key fix
  build: {
    outDir: 'dist'
  }
})

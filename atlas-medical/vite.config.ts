import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/pdf-helper/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Morita PDF Helper',
        short_name: 'Morita PDF',
        description: 'Herramienta de gestión documental médica',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  worker: {
    format: 'es'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('pdfjs-dist') || id.includes('pdf-lib')) return 'pdf-vendor'
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
          if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('zustand')) return 'ui-vendor'
        }
      }
    }
  }
})

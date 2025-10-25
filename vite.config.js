import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      axios: path.resolve(__dirname, 'src/lib/miniAxios.js'),
    },
  },
  server: {
    open: '/',
    proxy: {
      // Proxy para AUTH API Group
      '/xano-auth': {
        target: 'https://x8ki-letl-twmt.n7.xano.io/api:MJq6ok-f',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/xano-auth/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('❌ Auth proxy error:', err))
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🔐 Auth:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('✅ Auth response:', proxyRes.statusCode)
          })
        }
      },
      
      // Proxy para CORE API Group (cart, products, etc.)
      '/xano-core': {
        target: 'https://x8ki-letl-twmt.n7.xano.io/api:6y-a2otX',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/xano-core/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('❌ Core proxy error:', err))
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('🛒 Core:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('✅ Core response:', proxyRes.statusCode)
          })
        }
      },
    },
  },
})
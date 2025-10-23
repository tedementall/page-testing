import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Cualquier import "axios" usará tu miniAxios
      axios: path.resolve(__dirname, 'src/lib/miniAxios.js'),
    },
  },
  server: {
    open: '/',
    proxy: {
      // Todo lo que empiece con /xano se reenvía a Xano
      '/xano': {
        target: 'https://x8ki-let1-twmt.n7.xano.io',
        changeOrigin: true,
        secure: false, // ignora el cert inválido en desarrollo
        rewrite: (p) => p.replace(/^\/xano/, ''),
      },
    },
  },
})

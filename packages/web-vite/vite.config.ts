import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/v2': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

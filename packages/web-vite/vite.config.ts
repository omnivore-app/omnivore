import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
    // Optimize dev server performance
    hmr: {
      overlay: true,
    },
    watch: {
      // Reduce CPU usage by ignoring large directories
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  resolve: {
    alias: {
      react: 'react',
      'react-dom': 'react-dom',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'dompurify'],
  },
  // Build optimization (affects both dev and prod)
  build: {
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Enable minification for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Advanced code splitting strategy
        manualChunks(id) {
          // React vendor bundle
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router/')
          ) {
            return 'react-vendor'
          }
          // DOMPurify for security (used in ReaderPage)
          if (id.includes('node_modules/dompurify/')) {
            return 'security'
          }
          // GraphQL client and utilities
          if (
            id.includes('src/lib/graphql-client') ||
            id.includes('src/lib/contentHash') ||
            id.includes('src/lib/anchoredHighlights')
          ) {
            return 'api-utils'
          }
          // Component chunks by feature
          if (id.includes('src/pages/ReaderPage')) {
            return 'reader'
          }
          if (id.includes('src/pages/LibraryPage')) {
            return 'library'
          }
          if (id.includes('src/pages/LabelsPage')) {
            return 'labels'
          }
          // Modal components (lazy loaded)
          if (
            id.includes('src/components/') &&
            (id.includes('Modal') || id.includes('Sidebar'))
          ) {
            return 'modals'
          }
        },
        // Optimize chunk file names for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/css/i.test(ext)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Increase chunk size limit for better compression
    cssCodeSplit: true, // Enable CSS code splitting per route
  },
  // CSS optimization
  css: {
    devSourcemap: true,
  },
})

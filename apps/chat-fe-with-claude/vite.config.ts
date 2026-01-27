import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Socket.IO requests to backend
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          // Query and state management
          'query-vendor': ['@tanstack/react-query'],
          // Socket.io
          'socket-vendor': ['socket.io-client'],
          // Router
          'router-vendor': ['react-router-dom'],
          // Icons
          'icon-vendor': ['lucide-react'],
          // Forms and UI
          'ui-vendor': ['react-hook-form', 'zustand'],
        },
      },
    },
    // Optimize bundle size
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production
    reportCompressedSize: false, // Skip gzip size reporting for faster builds
    chunkSizeWarningLimit: 1000, // Increase warning threshold
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'socket.io-client',
      'react-router-dom',
      'react-hook-form',
      'zustand',
    ],
  },
})

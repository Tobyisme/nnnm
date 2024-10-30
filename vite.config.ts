import { defineConfig } from 'vite'
import * as vuePlugin from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    vuePlugin.default(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: '儀優管理系統',
        short_name: '儀優',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'primevue': path.resolve(__dirname, 'node_modules/primevue')
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    commonjsOptions: {
      include: [/primevue/, /@supabase/]
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'supabase'
            }
            if (id.includes('primevue') || id.includes('vue')) {
              return 'vendor'
            }
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
      external: [],
    }
  },
  optimizeDeps: {
    include: [
      'primevue/ripple',
      'primevue/utils',
      'primevue/api',
      '@supabase/supabase-js'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    cors: true,
  }
})

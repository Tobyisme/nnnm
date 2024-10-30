import { defineConfig } from 'vite'
import * as vuePlugin from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vuePlugin.default()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
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
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    cors: true,
  }
})

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

// Standalone build: bundle Vue into UMD so HTML pages don't need Vue
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJs(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib/index.ts', import.meta.url)),
      name: 'ChatBotWidget',
      formats: ['umd'],
      fileName: () => 'chat-bot-widget.standalone.umd.js',
    },
    rollupOptions: {
      // Do NOT externalize Vue – bundle it into the UMD output
      external: [],
      output: {
        // No globals mapping needed since nothing is externalized
      }
    }
  }
})
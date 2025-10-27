import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
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
      formats: ['es', 'umd'],
      fileName: (format) => format === 'es' ? 'chat-bot-widget.mjs' : 'chat-bot-widget.umd.js',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
})

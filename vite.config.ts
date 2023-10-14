import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: `[name].js`,
      },
    },
  },
  plugins: [
    copy({
      targets: [
        { src: resolve(__dirname, 'src/manifest.json'), dest: 'dist' },
      ],
      hook: 'writeBundle',
    }),
    react(),
  ],
})

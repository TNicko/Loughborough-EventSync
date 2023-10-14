import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';


const resolveDir = dir => path.resolve(__dirname, dir);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
        '@': resolveDir('./src'),
    }
  }
})
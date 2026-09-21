import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      // Matches the host port docker-compose.yml publishes for the backend
      // (8081:80). Running the backend directly with `npm run dev` for
      // local (non-container) dev needs `PORT=8081` set to match.
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  }
})

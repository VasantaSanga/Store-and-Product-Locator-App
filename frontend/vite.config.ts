import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port, to avoid conflict with backend on 3000
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:3000', // Backend runs on port 3000 as per .env
        changeOrigin: true,
      }
    }
  }
})

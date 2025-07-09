import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port, to avoid conflict with backend on 3000
    allowedHosts: ['d7608345594c.ngrok-free.app'],
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:3001', // Backend runs on port 3001 as per backend/src/index.ts
        changeOrigin: true,
      }
    }
  }
})

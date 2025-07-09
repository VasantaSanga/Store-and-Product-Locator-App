import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 5173, // Default Vite port, to avoid conflict with backend on 3000
      allowedHosts: ['d7608345594c.ngrok-free.app'],
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: env.VITE_API_URL, // Use environment variable instead of hardcoded URL
          changeOrigin: true,
        }
      }
    }
  }
})

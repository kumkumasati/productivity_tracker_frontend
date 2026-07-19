import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite's default dev port is 5173, which matches the backend's CorsConfig
// (allowedOrigins = http://localhost:5173). Don't change the port without
// updating CorsConfig.java on the backend too.
export default defineConfig({
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow access from ngrok (and other external hostnames) during dev
    allowedHosts: true,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 7891,
    host: '0.0.0.0',
    // Allow connections from bardsbrain01.merck.com through bardsbrain20.merck.com
    // This generates an array of hostnames for the development server to accept connections from
    allowedHosts: Array.from({ length: 20 }, (_, i) => `bardsbrain${String(i + 1).padStart(2, '0')}.merck.com`)
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  worker: {
    format: 'es'
  }
})
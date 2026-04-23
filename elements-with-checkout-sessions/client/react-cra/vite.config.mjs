import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: "0.0.0.0",
    allowedHosts: ["frontend", "localhost", "web"],
    proxy: {
        '/api': {
          target: process.env.VITE_SERVER_URL || 'http://localhost:4242',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
    }
  },
  build: {
    outDir: "build",
  },
})

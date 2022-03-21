import { defineConfig } from 'vite'
import pluginRewriteAll from 'vite-plugin-rewrite-all';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), pluginRewriteAll()],
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.SERVER_URL || 'http://localhost:4242',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      }
    }
  }
})

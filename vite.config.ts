import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/learnport-web/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['.manus.computer', 'localhost', '127.0.0.1'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      '/api': {
        target: 'https://doo-backend-1ldv.onrender.com',
        changeOrigin: true,
        secure: false, // skip SSL check if using self-signed cert
        rewrite: path => path.replace(/^\/api/, '/chatbot')
      }
    }
  }
})
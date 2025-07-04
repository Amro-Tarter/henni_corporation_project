import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc';
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // THIS IS REQUIRED
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173, // or any other port
  }
  
})

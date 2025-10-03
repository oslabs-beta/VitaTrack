import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { 
    proxy: { 
      '/api': { 
        target: 'http://localhost:5001',  // Changed from 3000
        changeOrigin: true 
      },
      '/auth': {  // Added this
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    } 
  },
});
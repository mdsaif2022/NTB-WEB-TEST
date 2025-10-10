import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client'),
    },
  },
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        user: resolve(__dirname, 'user.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  }
});

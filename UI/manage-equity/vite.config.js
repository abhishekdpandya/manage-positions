// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,  // For WSL, Docker, or network-mounted FS
    },
    hmr: true
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@plugins': resolve(__dirname, 'plugins')
    }
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from plugins directory
      allow: ['..']
    }
  }
});
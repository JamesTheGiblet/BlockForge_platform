import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// 🟢 ESM Helper: Define __dirname manually since we are in "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Root directory for source files
  root: 'src',
  
  // Public assets directory (relative to project root)
  publicDir: '../public',
  
  // Base public path
  base: '/',
  
  server: {
    port: 3000,
    open: true,
    // Allow serving files from the project root (one level up from src)
    fs: {
      allow: ['..']
    }
  },

  // 🟢 FIX: Map URL paths to actual file system folders
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '/plugins': path.resolve(__dirname, 'plugins') // Maps http://.../plugins to ./plugins/
    }
  },

  // Build config
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html')
      }
    }
  }
});
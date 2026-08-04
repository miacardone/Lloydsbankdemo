import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * Vite 8 bundles with Rolldown, which takes the function form.
         * Recharts is the heaviest dependency and only half the routes need it,
         * so it gets its own chunk rather than riding along in the vendor bundle.
         */
        manualChunks(moduleId) {
          if (!moduleId.includes('node_modules')) return undefined;
          if (moduleId.includes('recharts') || moduleId.includes('d3-')) return 'charts';
          if (moduleId.includes('react-router')) return 'router';
          if (moduleId.includes('/react/') || moduleId.includes('/react-dom/')) return 'react';
          return 'vendor';
        },
      },
    },
  },
});

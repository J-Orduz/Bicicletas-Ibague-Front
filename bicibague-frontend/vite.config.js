import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@styles': '/src/styles',
      '@pages': '/src/pages',
      '@layouts': '/src/layouts',
      '@hooks': '/src/hooks',
      '@api': '/src/services/api',
    },
  },
});

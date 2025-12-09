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
        // rewrite: (path) => {
        // if (path.startsWith('/api/not-prefix')) {
        //   // si la endpoint no tiene /api al inicio, el fetch se envia como /api/not-prefix y se elimina
        //   return path.replace('/api/not-prefix', '');
        // }
        // return path;
      // },
      },
      '/functions/v1/': {
        target: 'https://rzpwjfvfiepqjiphvyow.supabase.co',
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
      '@components': '/src/components',
      '@contexts': '/src/store/contexts',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React DOM en su propio chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separar las librerías de mapas (pesadas)
          'map-vendor': ['leaflet', 'react-leaflet'],
          
          // Separar Three.js en chunks individuales para mejor code-splitting
          'three': ['three'],
          'ogl': ['ogl'],
          'postprocessing': ['postprocessing'],
          
          // Separar iconos
          'icons-vendor': ['react-icons'],
        },
      },
    },
    // Aumentar el límite de advertencia de tamaño de chunk a 1000 kB
    chunkSizeWarningLimit: 1000,
    // Usar esbuild para minificación (más rápido y ya incluido)
    minify: 'esbuild',
  },
});

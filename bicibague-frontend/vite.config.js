import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@assets': '/src/assets',
      '@styles': '/src/assets/styles',
      '@components': '/src/components',
      '@hooks': '/src/common/hooks',
    },
  },
})

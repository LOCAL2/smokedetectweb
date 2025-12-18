import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ngrok': {
        target: 'https://nonbulbous-latia-unconsolingly.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ngrok/, '/api/sensor'),
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})

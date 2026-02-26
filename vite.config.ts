
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/gesundheits-tracker-web-1/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});

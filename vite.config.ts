import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 8000,
      watch: {
        ignored: ['**/backend/**', '**/node_modules/**']
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(""),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

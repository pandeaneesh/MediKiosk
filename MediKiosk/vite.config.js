import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false,
    watch: {
      ignored: [
        '**/backend/**',
        '**/*.db',
        '**/*.db-journal',
        '**/*.db-wal',
        '**/*.db-shm',
        '**/.git/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.system_generated/**',
        '**/.gemini/**'
      ]
    }
  },
});


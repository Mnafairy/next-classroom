import { defineConfig } from 'vite';

export default defineConfig({
  base: '/kodlab/',
  server: { proxy: { '/api': 'http://localhost:3000' } },
  build: {
    outDir: '../../public/kodlab',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          editor: ['codemirror', '@codemirror/view', '@codemirror/state', '@codemirror/lang-javascript'],
          parser: ['acorn'],
        },
      },
    },
  },
});

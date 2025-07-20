import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      enableBuild: true,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Baratie',
      fileName: 'index',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: true,
      format: {
        beautify: false,
        comments: false,
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});

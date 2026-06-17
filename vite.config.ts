import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import { configDefaults } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      mode !== 'production' &&
        checker({
          typescript: true,
          enableBuild: false,
        }),
    ].filter(Boolean),
    build: {
      lib: {
        entry: 'src/index.ts',
        name: 'Baratie',
        fileName: 'index',
        formats: ['iife'],
      },
      rollupOptions: {
        external: ['baratie'],
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
    test: {
      include: ['src/**/*.{test,spec}.{ts,mts,cts}'],
      exclude: [...configDefaults.exclude],
      watch: false,
      testTimeout: 10_000,
      passWithNoTests: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  };
});

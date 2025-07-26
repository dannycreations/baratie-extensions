import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,mts,cts}'],
    exclude: [...configDefaults.exclude],
    watch: false,
    testTimeout: 10_000,
    passWithNoTests: true,
  },
});

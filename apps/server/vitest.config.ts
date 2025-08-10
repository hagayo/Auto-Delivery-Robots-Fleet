/// <reference types="vitest" />
import path from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['test/**/*.spec.ts']
  },
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // point to the source during tests for stable named exports
      '@fleetops/sim-engine': path.resolve(__dirname, '../../packages/sim-engine/src/index.ts')
    }
  }
});

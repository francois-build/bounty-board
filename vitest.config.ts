
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './firestore.test.ts',
    testTimeout: 10000, // For slower emulator startups
    // To prevent conflicts with the running app
    port: 5174, 
    logHeapUsage: true,
    reporters: ['verbose'],
    minThreads: 1,
    maxThreads: 2
  },
});

import { defineConfig } from 'vitest/config'; export default defineConfig({ test: { environment: 'jsdom', include: ['**/*.spec.ts', '**/*.spec.tsx'], exclude: ['e2e/**'] } });

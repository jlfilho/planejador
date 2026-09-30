import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const port = new URL(baseURL).port || '3000';

export default defineConfig({ testDir: './e2e', use: { baseURL }, webServer: { command: `pnpm exec next dev --port ${port}`, url: baseURL, reuseExistingServer: true } });

import { defineConfig } from '@playwright/test';

const port = 4383;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    channel: process.env.TFT_PLAYWRIGHT_CHANNEL || undefined,
  },
  webServer: {
    command: 'node build/index.js',
    env: { HOST: '127.0.0.1', PORT: String(port), ORIGIN: baseURL },
    url: baseURL,
    timeout: 20_000,
  },
});

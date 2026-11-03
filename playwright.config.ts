import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', use: { baseURL: 'http://localhost:3100', channel: 'msedge', headless: true }, workers: 1 });

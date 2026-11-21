import {defineConfig, devices} from '@playwright/test';

// Read-only verification. No screenshot/video/trace or HTML report artifacts unless explicitly requested.
const externalBrowser = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const launchOptions = externalBrowser ? {executablePath: externalBrowser} : {};
export default defineConfig({
  testDir:'./e2e', testMatch:'*.spec.mjs', timeout:45000,
  expect:{timeout:15000}, fullyParallel:false, retries:0, workers:1,
  reporter:[['line']], outputDir:'.playwright-tmp',
  use:{baseURL:'http://127.0.0.1:4179',headless:true,trace:'off',screenshot:'off',video:'off',
    launchOptions},
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4179 --strictPort',
    url:'http://127.0.0.1:4179',reuseExistingServer:!process.env.CI,timeout:60000},
  projects:[
    {name:'desktop-chromium',use:{...devices['Desktop Chrome'],launchOptions}},
    {name:'mobile-chromium',use:{...devices['Pixel 7'],launchOptions}}
  ]
});

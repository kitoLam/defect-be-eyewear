import { defineConfig } from '@playwright/test';

/**
 * Playwright Configuration for Backend API Testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/tests',

  /* Maximum time one test can run for */
  timeout: 30 * 1000,

  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 5000
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Base URL to use in actions like `await page.goto('/')` */
    // baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  },

  /* Configure projects for API testing */
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});

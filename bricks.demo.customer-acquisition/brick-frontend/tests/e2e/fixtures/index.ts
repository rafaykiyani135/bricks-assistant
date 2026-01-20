import { test as base, Page } from '@playwright/test';
import { loginWithDemoButton } from '../helpers/auth';

type TestFixtures = {
  authenticatedPage: Page;
};

/**
 * Extended test with authenticated page fixture
 * Usage: test('my test', async ({ authenticatedPage }) => { ... })
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Setup: Login before each test
    await loginWithDemoButton(page);

    // Use the authenticated page in the test
    await use(page);

    // Teardown: No special cleanup needed
  },
});

export { expect } from '@playwright/test';

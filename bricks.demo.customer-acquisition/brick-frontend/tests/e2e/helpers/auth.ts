import { Page, expect } from '@playwright/test';
import { SELECTORS, URLS, TEST_DATA } from '../selectors';

/**
 * Demo credentials for testing
 */
export const DEMO_CREDENTIALS = TEST_DATA.demoUser;

/**
 * Login using demo credentials button
 */
export async function loginWithDemoButton(page: Page) {
  await page.goto(URLS.login);
  await page.waitForLoadState('networkidle');

  // Click demo credentials button
  const demoButton = page.locator(SELECTORS.auth.demoCredentialsButton);
  await expect(demoButton).toBeVisible({ timeout: 10000 });
  await demoButton.click();

  // Verify credentials are filled
  await expect(page.locator(SELECTORS.auth.emailInput)).toHaveValue(DEMO_CREDENTIALS.email);
  await expect(page.locator(SELECTORS.auth.passwordInput)).toHaveValue(DEMO_CREDENTIALS.password);

  // Submit form
  await page.click(SELECTORS.auth.submitButton);

  // Wait for navigation away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 15000,
  });

  await page.waitForLoadState('networkidle');
}

/**
 * Login with custom credentials
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto(URLS.login);
  await page.waitForLoadState('networkidle');

  // Fill credentials
  await page.fill(SELECTORS.auth.emailInput, email);
  await page.fill(SELECTORS.auth.passwordInput, password);

  // Submit form
  await page.click(SELECTORS.auth.submitButton);

  // Wait for navigation away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 15000,
  });

  await page.waitForLoadState('networkidle');
}

/**
 * Verify user is logged in by checking they're not on login page
 */
export async function verifyLoggedIn(page: Page) {
  const currentUrl = page.url();
  expect(currentUrl).not.toContain(URLS.login);
}

/**
 * Logout user
 */
export async function logout(page: Page) {
  // Implementation depends on your logout mechanism
  // This is a placeholder
  await page.goto('/logout');
  await page.waitForLoadState('networkidle');
}

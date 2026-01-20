import { Page, expect } from '@playwright/test';

export async function loginWithDemo(page: Page) {
  // Navigate to login
  await page.goto('/login');
  
  // Wait for page to load completely
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Use demo button to fill credentials
  const fillTestDataButton = page.locator('button', { hasText: /Usar credenciales de demo|Use demo credentials/i });
  await expect(fillTestDataButton).toBeVisible({ timeout: 10000 });
  await fillTestDataButton.click();
  
  // Wait for credentials to fill
  await page.waitForTimeout(1000);
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Wait for navigation with longer timeout
  await page.waitForLoadState('networkidle', { timeout: 10000 });
  await page.waitForTimeout(2000);
  
  // Verify login success (not on login page)
  const currentUrl = page.url();
  expect(currentUrl).not.toContain('/login');
}
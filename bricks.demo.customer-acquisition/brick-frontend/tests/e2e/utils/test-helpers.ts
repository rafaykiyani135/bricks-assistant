import { Page, expect } from '@playwright/test';

/**
 * Utility function to login using demo credentials
 * @param page - Playwright page object
 */
export async function loginWithDemoCredentials(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Use demo button to fill credentials
  const fillTestDataButton = page.locator('button', { hasText: /Usar credenciales de demo|Use demo credentials/i });
  await expect(fillTestDataButton).toBeVisible({ timeout: 10000 });
  await fillTestDataButton.click();
  
  // Wait for credentials to fill and verify
  await page.waitForTimeout(500);
  await expect(page.locator('input#email')).toHaveValue('juan.admin@brickcode.com');
  await expect(page.locator('input#password')).toHaveValue('admin123');
  
  // Submit login form
  await page.click('button[type="submit"]');
  
  // Wait for authentication to complete
  await page.waitForLoadState('networkidle');
  await page.waitForURL(/.*\/dashboard|.*\/$/);
}

/**
 * Utility function to create a test project
 * @param page - Playwright page object
 * @param projectName - Name for the project
 * @param clientName - Name for the client
 * @returns Promise that resolves when project is created
 */
export async function createTestProject(page: Page, projectName?: string, clientName?: string) {
  const defaultProjectName = projectName || `Test Project ${Date.now()}`;
  const defaultClientName = clientName || 'Test Client';
  
  await page.goto('/projects/new');
  
  // Fill project form with correct IDs
  await page.fill('#project-name', defaultProjectName);
  await page.fill('#project-client', defaultClientName);
  
  // Set valid dates
  const today = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);
  const endDateStr = endDate.toISOString().split('T')[0];
  
  await page.fill('#project-start-date', today);
  await page.fill('#project-end-date', endDateStr);
  
  // Submit form
  await page.click('button:has-text("Crear Proyecto Quote")');
  
  // Wait for success toast
  await expect(page.locator('div:has-text("¡Proyecto creado!")')).toBeVisible({ timeout: 5000 });
  
  return {
    name: defaultProjectName,
    client: defaultClientName,
    startDate: today,
    endDate: endDateStr
  };
}

/**
 * Utility function to navigate to the first available project detail page
 * @param page - Playwright page object
 */
export async function navigateToFirstProject(page: Page) {
  await page.goto('/projects');
  
  // Wait for projects to load
  await page.waitForLoadState('networkidle');
  
  // Look for "Ver detalle" buttons
  const detailButtons = page.locator('button:has-text("Ver detalle")');
  const buttonCount = await detailButtons.count();
  
  if (buttonCount > 0) {
    await detailButtons.first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h2:has-text("Jobs")')).toBeVisible();
    return true;
  }
  
  return false;
}

/**
 * Utility function to fill form fields safely (checks if field exists first)
 * @param page - Playwright page object
 * @param selector - CSS selector for the field
 * @param value - Value to fill
 */
export async function fillFieldSafely(page: Page, selector: string, value: string) {
  const field = page.locator(selector);
  if (await field.isVisible()) {
    await field.fill(value);
    return true;
  }
  return false;
}

/**
 * Utility function to click button safely (checks if button exists and is enabled first)
 * @param page - Playwright page object
 * @param selector - CSS selector for the button
 */
export async function clickButtonSafely(page: Page, selector: string) {
  const button = page.locator(selector);
  if (await button.isVisible() && await button.isEnabled()) {
    await button.click();
    return true;
  }
  return false;
}

/**
 * Utility to wait for toast messages
 * @param page - Playwright page object
 * @param message - Expected toast message text
 * @param timeout - Timeout in milliseconds (default 5000)
 */
export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.locator(`div:has-text("${message}")`);
  await expect(toast).toBeVisible({ timeout });
}

/**
 * Utility to verify project form validation
 * @param page - Playwright page object
 */
export async function verifyProjectFormValidation(page: Page) {
  // Check if create button is disabled when form is invalid
  const createButton = page.locator('button:has-text("Crear Proyecto Quote")');
  
  // Try to submit empty form
  if (await createButton.isEnabled()) {
    await createButton.click();
    await page.waitForTimeout(500);
  }
  
  // Verify validation - either button is disabled or error messages appear
  const isButtonDisabled = await createButton.getAttribute('disabled') !== null;
  const errorMessages = page.locator('.text-red-600, .error, [class*="error"]');
  const hasErrors = await errorMessages.count() > 0;
  
  return isButtonDisabled || hasErrors;
}
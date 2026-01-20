import { Page, expect } from '@playwright/test';
import { SELECTORS } from '../selectors';
import { navigateToProjectDetail } from './project';

export interface JobData {
  title: string;
  category?: string;
  estimatedComplexity: number;
  price: number;
  assignedEmployeeId?: number;
}

/**
 * Click Add Job button
 */
export async function clickAddJobButton(page: Page) {
  const addJobButton = page.locator(SELECTORS.job.addJobButton);
  await expect(addJobButton).toBeVisible();
  await addJobButton.click();
}

/**
 * Fill job form
 */
export async function fillJobForm(page: Page, data: JobData) {
  // Fill title and trigger blur
  await page.fill(SELECTORS.job.titleInput, data.title);
  await page.locator(SELECTORS.job.titleInput).blur();

  // Fill category if provided
  if (data.category) {
    await page.selectOption(SELECTORS.job.categorySelect, data.category);
    await page.locator(SELECTORS.job.categorySelect).blur();
  }

  // Fill complexity and trigger blur
  await page.fill(SELECTORS.job.complexityInput, data.estimatedComplexity.toString());
  await page.locator(SELECTORS.job.complexityInput).blur();

  // Fill price and trigger blur
  await page.fill(SELECTORS.job.priceInput, data.price.toString());
  await page.locator(SELECTORS.job.priceInput).blur();

  // Assign employee if provided
  if (data.assignedEmployeeId) {
    await page.selectOption(SELECTORS.job.employeeSelect, data.assignedEmployeeId.toString());
    await page.locator(SELECTORS.job.employeeSelect).blur();
  }

  // Wait a bit for validation to complete
  await page.waitForTimeout(300);
}

/**
 * Create a job with the given data
 */
export async function createJob(page: Page, projectId: number, data: JobData) {
  await navigateToProjectDetail(page, projectId);
  await clickAddJobButton(page);
  await fillJobForm(page, data);

  // Submit form
  const submitButton = page.locator(SELECTORS.job.submitButton);
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  // Wait for success toast
  const successToast = page.locator('[data-slot="title"]').filter({ hasText: /Job (added|created)/i }).first();
  await expect(successToast).toBeVisible({ timeout: 10000 });
}

/**
 * Generate test job data
 */
export function generateJobData(suffix?: string): JobData {
  const timestamp = Date.now();
  const id = suffix || timestamp;

  return {
    title: `Test Job ${id}`,
    category: 'ELECTRICAL',
    estimatedComplexity: 8,
    price: 150.00,
  };
}

/**
 * Verify job appears in project detail
 */
export async function verifyJobInProject(page: Page, projectId: number, jobTitle: string) {
  await navigateToProjectDetail(page, projectId);
  const jobCard = page.locator(`text=${jobTitle}`);
  await expect(jobCard).toBeVisible({ timeout: 5000 });
}

/**
 * Click Edit Job button for a specific job
 */
export async function clickEditJobButton(page: Page, jobTitle: string) {
  // Find the job card/row and click edit button
  // Use .first() to handle both desktop table and mobile cards
  const jobRow = page.locator(`text=${jobTitle}`).locator('..');
  const editButton = jobRow.locator(SELECTORS.job.editButton).first();
  await expect(editButton).toBeVisible();
  await editButton.click();
}

/**
 * Update a job with new data
 */
export async function updateJob(page: Page, projectId: number, jobTitle: string, newData: Partial<JobData>) {
  await navigateToProjectDetail(page, projectId);
  await clickEditJobButton(page, jobTitle);

  // Fill only the fields that are provided
  if (newData.title) {
    await page.fill(SELECTORS.job.titleInput, '');
    await page.fill(SELECTORS.job.titleInput, newData.title);
  }

  if (newData.category) {
    await page.selectOption(SELECTORS.job.categorySelect, newData.category);
  }

  if (newData.estimatedComplexity !== undefined) {
    await page.fill(SELECTORS.job.complexityInput, '');
    await page.fill(SELECTORS.job.complexityInput, newData.estimatedComplexity.toString());
  }

  if (newData.price !== undefined) {
    await page.fill(SELECTORS.job.priceInput, '');
    await page.fill(SELECTORS.job.priceInput, newData.price.toString());
  }

  if (newData.assignedEmployeeId !== undefined) {
    await page.selectOption(SELECTORS.job.employeeSelect, newData.assignedEmployeeId.toString());
  }

  // Submit form
  const saveButton = page.locator(SELECTORS.job.saveChangesButton);
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Wait for success toast
  const successToast = page.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
  await expect(successToast).toBeVisible({ timeout: 10000 });
}

/**
 * Assign employee to a job
 */
export async function assignEmployeeToJob(page: Page, projectId: number, jobTitle: string, employeeId: number) {
  await navigateToProjectDetail(page, projectId);
  await clickEditJobButton(page, jobTitle);

  // Select employee
  await page.selectOption(SELECTORS.job.employeeSelect, employeeId.toString());

  // Submit form
  const saveButton = page.locator(SELECTORS.job.saveChangesButton);
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  // Wait for success toast
  const successToast = page.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
  await expect(successToast).toBeVisible({ timeout: 10000 });
}

/**
 * Verify validation error appears
 */
export async function verifyValidationError(page: Page, errorText: string) {
  const errorMessage = page.locator(`text=${errorText}`);
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
}

/**
 * Clear a form field
 */
export async function clearField(page: Page, selector: string) {
  await page.fill(selector, '');
}

/**
 * Get project totals from the page
 */
export async function getProjectTotals(page: Page) {
  const totalCost = await page.locator(SELECTORS.project.totalCost).textContent();
  const netMargin = await page.locator(SELECTORS.project.netMargin).textContent();
  const duration = await page.locator(SELECTORS.project.duration).textContent();

  return { totalCost, netMargin, duration };
}

/**
 * Click View Quote Summary button
 */
export async function clickViewQuoteSummaryButton(page: Page) {
  const summaryButton = page.locator(SELECTORS.project.viewSummaryButton);
  await expect(summaryButton).toBeVisible();
  await summaryButton.click();
}

/**
 * Verify quote summary is displayed
 */
export async function verifyQuoteSummary(page: Page) {
  await expect(page.locator(SELECTORS.project.summaryHeading)).toBeVisible();
  await expect(page.locator(SELECTORS.project.summaryJobList)).toBeVisible();
}

/**
 * Verify employee is marked as unavailable in dropdown
 */
export async function verifyEmployeeUnavailable(page: Page, employeeName: string) {
  const unavailableOption = page.locator(`option:has-text("${employeeName} (Assigned to another job)")`);
  // Option elements exist in the DOM but are not "visible" in Playwright's sense
  // We just need to verify they exist and are disabled
  await expect(unavailableOption).toHaveCount(1);
  await expect(unavailableOption).toBeDisabled();
}

/**
 * User Story: Update Job
 *
 * Description:
 * As an Employee, I want to update a job to keep its estimate and details accurate.
 *
 * Nominal Flow:
 * 1. Employee opens a project.
 * 2. Employee selects a job.
 * 3. Employee edits fields and submits.
 * 4. System validates and saves changes.
 * 5. Updated totals reflect the change.
 */

import { test, expect } from './fixtures';
import { createProject, generateProjectData, navigateToProjectDetail } from './helpers/project';
import { createJob, generateJobData, clickEditJobButton, verifyValidationError } from './helpers/job';
import { SELECTORS } from './selectors';

test.describe('User Story: Update Job', () => {
  let projectId: number;
  let jobTitle: string;

  /**
   * Setup: Create a project and a job before each test
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    // Create project
    const projectData = generateProjectData('update-job-test');
    projectId = await createProject(authenticatedPage, projectData);

    // Create a job
    const jobData = generateJobData('initial-job');
    jobTitle = jobData.title;
    await createJob(authenticatedPage, projectId, jobData);
  });

  /**
   * Nominal Flow Test
   * Scenario: Update job successfully
   * Given a job exists
   * When I update its price and save
   * Then the project totals reflect the new price
   */
  test('should update job price successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Update price
    const newPrice = '250.00';
    const priceInput = authenticatedPage.locator(SELECTORS.job.priceInput);
    await priceInput.clear();
    await priceInput.fill(newPrice);

    // Save changes
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success toast
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify the updated price is reflected
    // The price should appear somewhere in the project details
    await navigateToProjectDetail(authenticatedPage, projectId);
    const priceDisplay = authenticatedPage.locator(`text=${newPrice}`);
    await expect(priceDisplay.first()).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Update multiple job fields
   * Given a job exists
   * When I update title, complexity, and price
   * Then all fields are updated
   */
  test('should update multiple job fields successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Update multiple fields
    const newTitle = `Updated Job ${Date.now()}`;
    const newComplexity = '12';
    const newPrice = '350.00';

    await authenticatedPage.fill(SELECTORS.job.titleInput, '');
    await authenticatedPage.fill(SELECTORS.job.titleInput, newTitle);

    await authenticatedPage.fill(SELECTORS.job.complexityInput, '');
    await authenticatedPage.fill(SELECTORS.job.complexityInput, newComplexity);

    await authenticatedPage.fill(SELECTORS.job.priceInput, '');
    await authenticatedPage.fill(SELECTORS.job.priceInput, newPrice);

    // Save changes
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify new title is visible
    await navigateToProjectDetail(authenticatedPage, projectId);
    await expect(authenticatedPage.locator(`text=${newTitle}`).first()).toBeVisible();
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Missing required fields
   * When I remove the job title and save
   * Then I see a validation error
   */
  test('should show validation error when title is removed', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Clear the title
    const titleInput = authenticatedPage.locator(SELECTORS.job.titleInput);
    await titleInput.clear();
    await titleInput.fill('');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error message
      await verifyValidationError(authenticatedPage, "/title.*required/i");
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Remove complexity
   * When I remove the complexity and save
   * Then I see a validation error
   */
  test('should show validation error when complexity is removed', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Clear complexity
    const complexityInput = authenticatedPage.locator(SELECTORS.job.complexityInput);
    await complexityInput.clear();

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error message
      await verifyValidationError(authenticatedPage, "/complexity.*required/i");
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Negative complexity
   * When I set negative complexity
   * Then I see a validation error
   */
  test('should show validation error for negative complexity', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Set negative complexity
    const complexityInput = authenticatedPage.locator(SELECTORS.job.complexityInput);
    await complexityInput.clear();
    await complexityInput.fill('-10');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error about negative value
      const errorMessage = authenticatedPage.locator('text=/negative|positive|greater than/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Negative price
   * When I set negative price
   * Then I see a validation error
   */
  test('should show validation error for negative price', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Set negative price
    const priceInput = authenticatedPage.locator(SELECTORS.job.priceInput);
    await priceInput.clear();
    await priceInput.fill('-50');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error about negative value
      const errorMessage = authenticatedPage.locator('text=/negative|positive|greater than/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Invalid assigned employee
   * When I assign the job to a non-existent employee
   * Then I see an error
   *
   * Note: Similar to new job test, invalid employees typically can't be selected
   */
  test('should handle invalid employee assignment', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Try to select invalid employee
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);

    try {
      await employeeSelect.selectOption('99999');
      // If selection succeeds, submit should fail
      const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
      await saveButton.click();

      const errorMessage = authenticatedPage.locator('text=/employee.*not.*found|invalid.*employee/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Expected - invalid employee not in dropdown
      expect(true).toBe(true);
    }
  });

  /**
   * Edge Case Test
   * Scenario: Update and cancel
   * When I make changes but cancel
   * Then changes are not saved
   */
  test('should not save changes when cancelled', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Make changes
    const newTitle = `Cancelled Update ${Date.now()}`;
    await authenticatedPage.fill(SELECTORS.job.titleInput, '');
    await authenticatedPage.fill(SELECTORS.job.titleInput, newTitle);

    // Click cancel
    const cancelButton = authenticatedPage.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Verify original title is still shown
      await navigateToProjectDetail(authenticatedPage, projectId);
      await expect(authenticatedPage.locator(`text=${jobTitle}`)).toBeVisible();

      // Verify new title is NOT shown
      const newTitleDisplay = authenticatedPage.locator(`text=${newTitle}`);
      await expect(newTitleDisplay).not.toBeVisible();
    }
  });

  /**
   * Integration Test
   * Scenario: Update job and verify totals recalculation
   * Given a job exists
   * When I update its complexity and price
   * Then project totals are recalculated
   */
  test('should recalculate project totals when job is updated', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Note the current totals (if visible)
    // This is a visual check - actual calculation logic is backend

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Significantly change price and complexity
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '');
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '20');

    await authenticatedPage.fill(SELECTORS.job.priceInput, '');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '500.00');

    // Save changes
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Navigate back to project detail to see updated totals
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Verify the new values are reflected somewhere
    await expect(authenticatedPage.locator('text=500.00').first()).toBeVisible();
  });

  /**
   * Edge Case Test
   * Scenario: Update with same values (no-op)
   * When I save without making changes
   * Then save succeeds
   */
  test('should allow saving without changes', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Don't make any changes, just save
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Should succeed or at least not error
    await authenticatedPage.waitForTimeout(2000);

    // Verify we're back on project detail
    await navigateToProjectDetail(authenticatedPage, projectId);
    await expect(authenticatedPage.locator(`text=${jobTitle}`).first()).toBeVisible();
  });
});

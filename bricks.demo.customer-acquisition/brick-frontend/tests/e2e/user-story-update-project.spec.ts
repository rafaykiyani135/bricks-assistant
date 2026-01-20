/**
 * User Story: Update Project
 *
 * Description:
 * As an Employee, I want to update a project's information to keep the estimate accurate.
 *
 * Nominal Flow:
 * 1. Employee opens a project.
 * 2. Employee clicks "Edit Project".
 * 3. Employee updates fields and submits.
 * 4. System validates and saves changes.
 * 5. Project details page reflects updated info.
 */

import { test, expect } from './fixtures';
import { createProject, generateProjectData, navigateToProjectDetail } from './helpers/project';
import { SELECTORS } from './selectors';

test.describe('User Story: Update Project', () => {
  let projectId: number;
  let originalProjectData: ReturnType<typeof generateProjectData>;

  /**
   * Setup: Create a project before each test
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    originalProjectData = generateProjectData('update-test');
    projectId = await createProject(authenticatedPage, originalProjectData);
  });

  /**
   * Nominal Flow Test
   * Scenario: Update project successfully
   * Given a project exists
   * When I change its client name and save
   * Then the updated client name is shown
   */
  test('should update project client name successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Update client name
    const newClientName = `Updated Client ${Date.now()}`;
    const clientInput = authenticatedPage.locator(SELECTORS.project.clientInput);
    await clientInput.clear();
    await clientInput.fill(newClientName);

    // Save changes
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success toast
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Wait for modal to close and page to update
    await authenticatedPage.waitForTimeout(1000);

    // Verify updated client name is shown in the project header
    await expect(authenticatedPage.locator('p.text-sm').filter({ hasText: newClientName }).first()).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Update multiple project fields
   * Given a project exists
   * When I update name, client, and dates
   * Then all updated fields are reflected
   */
  test('should update multiple project fields successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Update multiple fields
    const newName = `Updated Project ${Date.now()}`;
    const newClient = `Updated Client ${Date.now()}`;
    const newStartDate = '2025-01-01';
    const newEndDate = '2025-06-30';

    await authenticatedPage.fill(SELECTORS.project.nameInput, '');
    await authenticatedPage.fill(SELECTORS.project.nameInput, newName);

    await authenticatedPage.fill(SELECTORS.project.clientInput, '');
    await authenticatedPage.fill(SELECTORS.project.clientInput, newClient);

    await authenticatedPage.fill(SELECTORS.project.startDateInput, newStartDate);
    await authenticatedPage.fill(SELECTORS.project.endDateInput, newEndDate);

    // Save changes
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Wait for modal to close and page to update
    await authenticatedPage.waitForTimeout(1000);

    // Verify all fields are updated in the project header
    await expect(authenticatedPage.locator('h1').filter({ hasText: newName }).first()).toBeVisible();
    await expect(authenticatedPage.locator('p.text-sm').filter({ hasText: newClient }).first()).toBeVisible();
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Missing required fields
   * When I remove the project name and save
   * Then I see a validation error
   */
  test('should show validation error when project name is removed', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Clear the project name
    const nameInput = authenticatedPage.locator(SELECTORS.project.nameInput);
    await nameInput.clear();
    await nameInput.fill('');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);

    // Check if button is disabled or error appears on submit
    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error message
      const errorMessage = authenticatedPage.locator('text=/name.*required|required.*field/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      // Button disabled is correct behavior
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Missing required fields - client
   * When I remove the client name and save
   * Then I see a validation error
   */
  test('should show validation error when client is removed', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Clear the client name
    const clientInput = authenticatedPage.locator(SELECTORS.project.clientInput);
    await clientInput.clear();
    await clientInput.fill('');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error message
      const errorMessage = authenticatedPage.locator('text=/client.*required|required.*field/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Invalid dates
   * When I set end date before start date
   * Then I see a validation error
   */
  test('should show validation error when end date is before start date', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Set end date before start date
    await authenticatedPage.fill(SELECTORS.project.startDateInput, '2025-06-01');
    await authenticatedPage.fill(SELECTORS.project.endDateInput, '2025-01-01');

    // Try to save
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);

    const isDisabled = await saveButton.isDisabled();
    if (!isDisabled) {
      await saveButton.click();
      // Verify error message about invalid date range
      const errorMessage = authenticatedPage.locator('text=/end date.*after|invalid.*date|date.*range/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Invalid date format
   * When I enter an invalid date
   * Then I see a validation error
   */
  test('should handle invalid date formats', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // HTML5 date inputs typically prevent invalid formats,
    // but we can test clearing required dates
    const startDateInput = authenticatedPage.locator(SELECTORS.project.startDateInput);
    await startDateInput.clear();

    // Try to save without start date
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);
    const isDisabled = await saveButton.isDisabled();

    if (!isDisabled) {
      await saveButton.click();
      // Should show error about missing or invalid date
      const errorMessage = authenticatedPage.locator('text=/date.*required|invalid.*date/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  /**
   * Edge Case Test
   * Scenario: Update and cancel
   * When I make changes but click cancel
   * Then changes are not saved
   */
  test('should not save changes when cancel is clicked', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Remember original client name
    const originalClient = originalProjectData.client;

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Make a change
    const newClientName = `Cancelled Update ${Date.now()}`;
    await authenticatedPage.fill(SELECTORS.project.clientInput, '');
    await authenticatedPage.fill(SELECTORS.project.clientInput, newClientName);

    // Click cancel button
    const cancelButton = authenticatedPage.locator('button:has-text("Cancel")');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Verify original data is still shown
      await expect(authenticatedPage.locator(`text=${originalClient}`)).toBeVisible();

      // Verify new name is NOT shown
      const newClientDisplay = authenticatedPage.locator(`text=${newClientName}`);
      await expect(newClientDisplay).not.toBeVisible();
    }
  });

  /**
   * Edge Case Test
   * Scenario: Update with same values
   * When I save without making changes
   * Then save should succeed (no-op)
   */
  test('should allow saving without changes', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Edit Project" button
    const editButton = authenticatedPage.locator(SELECTORS.project.editButton);
    await editButton.click();

    // Don't make any changes, just save
    const saveButton = authenticatedPage.locator(SELECTORS.project.saveButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Should succeed (or at least not show error)
    // Either success toast or just return to detail view
    await authenticatedPage.waitForTimeout(2000);

    // Verify we're back on detail page (not showing form errors)
    const projectDetail = authenticatedPage.locator(`text=${originalProjectData.name}`).first();
    await expect(projectDetail).toBeVisible();
  });
});

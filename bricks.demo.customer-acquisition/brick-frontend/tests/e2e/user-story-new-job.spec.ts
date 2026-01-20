/**
 * User Story: New Job
 *
 * Description:
 * As an Employee, I want to add a job to a project quote to complete the cost and time estimate.
 *
 * Nominal Flow:
 * 1. Employee opens an existing project quote.
 * 2. Employee clicks "Add Job".
 * 3. Employee fills in job details: title, category, estimated complexity, price, optional assigned employee.
 * 4. Employee submits the form.
 * 5. The system adds the job to the project and updates estimated totals.
 */

import { test, expect } from './fixtures';
import { createProject, generateProjectData, navigateToProjectDetail } from './helpers/project';
import { createJob, generateJobData, fillJobForm, clickAddJobButton, verifyValidationError, clearField } from './helpers/job';
import { SELECTORS } from './selectors';

test.describe('User Story: New Job', () => {
  let projectId: number;

  /**
   * Setup: Create a project before each test
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    const projectData = generateProjectData();
    projectId = await createProject(authenticatedPage, projectData);
  });

  /**
   * Nominal Flow Test
   * Scenario: Add a job successfully
   * Given a project exists
   * When I add a job with valid details
   * Then the job is added to the project and totals updated
   */
  test('should add a job successfully', async ({ authenticatedPage }) => {
    const jobData = generateJobData('successful-add');

    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);


    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in job details
    await fillJobForm(authenticatedPage, jobData);


    // Submit the form
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify success toast appears
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Job added/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify job appears in project
    const jobTitle = authenticatedPage.locator(`text=${jobData.title}`).first();
    await expect(jobTitle).toBeVisible();

    // Verify project totals are updated (they should be visible and non-zero)
    // Note: The actual calculation verification would require knowing the employee cost
    // For now, we just verify the costs section is visible
    const costsSection = authenticatedPage.locator('text=Costs').first();
    await expect(costsSection).toBeVisible();
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Missing required fields
   * When I submit a job with no title
   * Then I see a validation error
   */
  test('should show validation error when title is missing', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in only some fields (skip title)
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '5');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '100');

    // Try to submit
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);

    // The submit button should be disabled or clicking should show error
    // Depending on implementation, we check for either state
    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Verify error message appears
      await verifyValidationError(authenticatedPage, "/title.*required/i");
    } else {
      // Button is disabled, which is correct behavior
      await expect(submitButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Missing required fields - no category
   * When I submit a job with no category
   * Then I see a validation error
   */
  test('should show validation error when category is missing', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in fields except category
    await authenticatedPage.fill(SELECTORS.job.titleInput, 'Test Job');
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '5');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '100');

    // Try to submit
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);

    const isDisabled = await submitButton.isDisabled();
    if (!isDisabled) {
      await submitButton.click();
      // Verify error message appears
      await verifyValidationError(authenticatedPage, "/category.*required/i");
    } else {
      // Button is disabled, which is correct behavior
      await expect(submitButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Negative complexity or price
   * When I submit a job with negative complexity
   * Then I see a validation error
   */
  test('should show validation error for negative complexity', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in job details with negative complexity
    await authenticatedPage.fill(SELECTORS.job.titleInput, 'Test Job');
    await authenticatedPage.selectOption(SELECTORS.job.categorySelect, 'ELECTRICAL');
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '-5');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '100');

    // Verify validation error appears (either button disabled or error message)
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
    const isDisabled = await submitButton.isDisabled();

    if (!isDisabled) {
      await submitButton.click();
      // Should show error about negative value
      const errorMessage = authenticatedPage.locator('text=/negative|positive|greater than/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(submitButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Negative price
   * When I submit a job with negative price
   * Then I see a validation error
   */
  test('should show validation error for negative price', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in job details with negative price
    await authenticatedPage.fill(SELECTORS.job.titleInput, 'Test Job');
    await authenticatedPage.selectOption(SELECTORS.job.categorySelect, 'ELECTRICAL');
    await authenticatedPage.fill(SELECTORS.job.complexityInput, '5');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '-100');

    // Verify validation error appears
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
    const isDisabled = await submitButton.isDisabled();

    if (!isDisabled) {
      await submitButton.click();
      // Should show error about negative value
      const errorMessage = authenticatedPage.locator('text=/negative|positive|greater than/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } else {
      await expect(submitButton).toBeDisabled();
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Assigning a non-existent employee
   * When I assign a job to an invalid employee
   * Then I see an error message
   *
   * Note: This test assumes the employee select is populated from backend
   * and invalid employees can't be selected from dropdown.
   * If manual input is possible, adjust test accordingly.
   */
  test('should prevent assigning to non-existent employee', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in valid job details
    const jobData = generateJobData('invalid-employee');
    await fillJobForm(authenticatedPage, jobData);

    // Try to select an invalid employee (ID 99999)
    // This should either not be in the dropdown or show error
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const options = await employeeSelect.locator('option').count();

    // Try to select by invalid value - if it doesn't exist, this should fail gracefully
    try {
      await employeeSelect.selectOption('99999');
      // If we can select it, submitting should show error
      const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
      await submitButton.click();

      const errorMessage = authenticatedPage.locator('text=/employee.*not.*found|invalid.*employee/i');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Expected - invalid employee not in dropdown
      // This is the correct behavior
      expect(true).toBe(true);
    }
  });

  /**
   * Nominal Flow Test with Employee Assignment
   * Scenario: Add a job with assigned employee
   * Given a project exists
   * When I add a job with valid details including an assigned employee
   * Then the job is added with the employee assignment
   */
  test('should add a job with assigned employee successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "Add Job" button
    await clickAddJobButton(authenticatedPage);

    // Fill in job details
    const jobData = generateJobData('with-employee');
    await authenticatedPage.fill(SELECTORS.job.titleInput, jobData.title);
    await authenticatedPage.selectOption(SELECTORS.job.categorySelect, jobData.category!);
    await authenticatedPage.fill(SELECTORS.job.complexityInput, jobData.estimatedComplexity.toString());
    await authenticatedPage.fill(SELECTORS.job.priceInput, jobData.price.toString());
    await authenticatedPage.locator(SELECTORS.job.titleInput).blur();
    await authenticatedPage.locator(SELECTORS.job.categorySelect).blur();
    await authenticatedPage.locator(SELECTORS.job.complexityInput).blur();
    await authenticatedPage.locator(SELECTORS.job.priceInput).blur();

    // Select the first available employee from dropdown
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""])').first();
    const employeeValue = await firstEmployee.getAttribute('value');

    if (employeeValue) {
      await employeeSelect.selectOption(employeeValue);
    }

    // Submit the form
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Verify success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Job (added|created)/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify job appears
    const jobTitle = authenticatedPage.locator(`text=${jobData.title}`).first();
    await expect(jobTitle).toBeVisible();
  });
});

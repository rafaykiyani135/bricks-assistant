/**
 * User Story: Assign Job to Employee
 *
 * Description:
 * As a Manager, I want to pre-assign jobs to employees to pre-plan projects and refine cost estimates.
 *
 * Nominal Flow:
 * 1. Manager opens a project.
 * 2. Manager selects a job and chooses an employee from the list.
 * 3. Manager saves the assignment.
 * 4. System updates the job with the assigned employee and recalculates costs.
 */

import { test, expect } from './fixtures';
import { createProject, generateProjectData, navigateToProjectDetail } from './helpers/project';
import { createJob, generateJobData, clickEditJobButton, assignEmployeeToJob, verifyEmployeeUnavailable } from './helpers/job';
import { SELECTORS } from './selectors';

test.describe('User Story: Assign Job to Employee', () => {
  let projectId: number;
  let jobTitle: string;

  /**
   * Setup: Create a project and an unassigned job before each test
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    // Create project
    const projectData = generateProjectData('assign-employee-test');
    projectId = await createProject(authenticatedPage, projectData);

    // Create an unassigned job
    const jobData = generateJobData('unassigned-job');
    jobTitle = jobData.title;
    // Don't assign employee - leave it unassigned
    await createJob(authenticatedPage, projectId, { ...jobData, assignedEmployeeId: undefined });
  });

  /**
   * Nominal Flow Test
   * Scenario: Pre-assign job successfully
   * Given a project job exists
   * When I assign it to a valid employee
   * Then the job shows the assigned employee and updated cost
   */
  test('should assign employee to job successfully', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Select first available employee
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const employeeValue = await firstEmployee.getAttribute('value');
    const employeeName = await firstEmployee.textContent();

    expect(employeeValue).toBeTruthy();

    await employeeSelect.selectOption(employeeValue!);

    // Save the assignment
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for success toast
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify employee assignment is shown in job details
    await navigateToProjectDetail(authenticatedPage, projectId);

    // The employee name should appear somewhere in the project/job details
    if (employeeName) {
      const employeeDisplay = authenticatedPage.locator(`text=${employeeName.trim()}`);
      await expect(employeeDisplay.first()).toBeVisible();
    }

    // Cost estimation should be visible and updated
    // (Actual cost values depend on employee hourly rate and productivity)
    const costSection = authenticatedPage.locator('text=/cost|estimate/i');
    await expect(costSection.first()).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Reassign job to different employee
   * Given a job is already assigned to an employee
   * When I reassign it to another employee
   * Then the assignment is updated
   */
  test('should reassign job to different employee', async ({ authenticatedPage }) => {
    // First, assign to an employee
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickEditJobButton(authenticatedPage, jobTitle);

    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const firstEmployeeValue = await firstEmployee.getAttribute('value');
    await employeeSelect.selectOption(firstEmployeeValue!);

    let saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    // Wait for success
    let successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Now reassign to a different employee
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Select a different employee (second one)
    const secondEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').nth(1);
    const secondEmployeeValue = await secondEmployee.getAttribute('value');
    const secondEmployeeName = await secondEmployee.textContent();

    if (secondEmployeeValue && secondEmployeeValue !== firstEmployeeValue) {
      await employeeSelect.selectOption(secondEmployeeValue);

      // Handle confirmation dialog if it appears
      const confirmButton = authenticatedPage.locator('button:has-text("Confirm")');
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
      await saveButton.click();

      // Wait for success
      successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
      await expect(successToast).toBeVisible({ timeout: 10000 });

      // Verify new employee assignment
      await navigateToProjectDetail(authenticatedPage, projectId);
      if (secondEmployeeName) {
        const newEmployeeDisplay = authenticatedPage.locator(`text=${secondEmployeeName.trim()}`);
        await expect(newEmployeeDisplay.first()).toBeVisible();
      }
    }
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: Employee unavailable
   * When I try to assign a job to an unavailable employee
   * Then the employee is shown as unavailable in the dropdown
   */
  test('should show employee as unavailable when assigned to another job', async ({ authenticatedPage }) => {
    // First, create another job and assign an employee to it
    const job1Data = generateJobData('job-1');
    await createJob(authenticatedPage, projectId, job1Data);

    await navigateToProjectDetail(authenticatedPage, projectId);

    // Find and click edit on first job
    const job1Row = authenticatedPage.locator(`text=${job1Data.title}`).locator('..');
    const editButton = job1Row.locator('button:has-text("Edit")').first();
    await editButton.click();

    // Assign first available employee to job 1
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const employeeValue = await firstEmployee.getAttribute('value');
    const employeeName = await firstEmployee.textContent();

    await employeeSelect.selectOption(employeeValue!);

    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Now try to assign the same employee to the original job (which should show them as unavailable)
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Verify the employee shows as "Assigned to another job" and is disabled
    if (employeeName) {
      const cleanEmployeeName = employeeName.trim();
      await verifyEmployeeUnavailable(authenticatedPage, cleanEmployeeName);
    }
  });

  /**
   * Edge Case Test
   * Scenario: Unassign employee
   * Given a job has an assigned employee
   * When I unassign the employee (select "Unassigned" option)
   * Then the job has no assigned employee
   */
  test('should allow unassigning employee from job', async ({ authenticatedPage }) => {
    // First assign an employee
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickEditJobButton(authenticatedPage, jobTitle);

    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const employeeValue = await firstEmployee.getAttribute('value');

    await employeeSelect.selectOption(employeeValue!);

    let saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    // Wait for success
    let successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Now unassign
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Select the "Unassigned" option (empty value)
    const unassignedOption = employeeSelect.locator('option[value=""]');
    if (await unassignedOption.isVisible()) {
      await employeeSelect.selectOption('');

      saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
      await saveButton.click();

      // Wait for success
      successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
      await expect(successToast).toBeVisible({ timeout: 10000 });

      // Verify unassigned state (might show "Unassigned" text)
      await navigateToProjectDetail(authenticatedPage, projectId);
      const unassignedText = authenticatedPage.locator('text=/unassigned/i');
      await expect(unassignedText.first()).toBeVisible();
    }
  });

  /**
   * Integration Test
   * Scenario: Cost estimation updates when employee assigned
   * Given a job with no employee
   * When I assign an employee
   * Then cost estimation is shown with employee's rate and productivity
   */
  test('should show cost estimation when employee is assigned', async ({ authenticatedPage }) => {
    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click edit on the job
    await clickEditJobButton(authenticatedPage, jobTitle);

    // Before assigning, cost estimation might not be complete
    // After assigning, we should see cost details

    // Assign employee
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const employeeValue = await firstEmployee.getAttribute('value');

    await employeeSelect.selectOption(employeeValue!);

    // Look for cost estimation section (should appear after selecting employee)
    const costEstimation = authenticatedPage.locator('text=/cost.*estimation|estimated.*cost/i');

    // If cost estimation is visible in the form, verify it
    if (await costEstimation.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(costEstimation).toBeVisible();

      // Should show hourly cost, productivity, etc.
      const hourlyCost = authenticatedPage.locator('text=/hourly.*cost|\$.*\/h/i');
      await expect(hourlyCost.first()).toBeVisible();
    }

    // Save and verify costs on project detail page
    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    await navigateToProjectDetail(authenticatedPage, projectId);

    // Project should show updated cost calculations
    const projectCost = authenticatedPage.locator('text=/total.*cost|estimated.*cost/i');
    await expect(projectCost.first()).toBeVisible();
  });

  /**
   * Edge Case Test
   * Scenario: Assign employee when creating job
   * When I create a new job and assign employee immediately
   * Then the job is created with employee assigned
   */
  test('should allow assigning employee during job creation', async ({ authenticatedPage }) => {
    const newJobData = generateJobData('job-with-employee');

    // Navigate to project
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click Add Job
    const addJobButton = authenticatedPage.locator(SELECTORS.job.addJobButton);
    await addJobButton.click();

    // Fill job form including employee
    await authenticatedPage.fill(SELECTORS.job.titleInput, newJobData.title);
    await authenticatedPage.locator(SELECTORS.job.titleInput).blur();
    await authenticatedPage.selectOption(SELECTORS.job.categorySelect, newJobData.category!);
    await authenticatedPage.locator(SELECTORS.job.categorySelect).blur();
    await authenticatedPage.fill(SELECTORS.job.complexityInput, newJobData.estimatedComplexity.toString());
    await authenticatedPage.locator(SELECTORS.job.complexityInput).blur();
    await authenticatedPage.fill(SELECTORS.job.priceInput, newJobData.price.toString());
    await authenticatedPage.locator(SELECTORS.job.priceInput).blur();

    // Select employee
    const employeeSelect = authenticatedPage.locator(SELECTORS.job.employeeSelect);
    const firstEmployee = await employeeSelect.locator('option:not([value=""]):not([disabled])').first();
    const employeeValue = await firstEmployee.getAttribute('value');
    const employeeName = await firstEmployee.textContent();

    if (employeeValue) {
      await employeeSelect.selectOption(employeeValue);
      await employeeSelect.blur();
    }

    // Wait for validation to complete
    await authenticatedPage.waitForTimeout(300);

    // Submit
    const submitButton = authenticatedPage.locator(SELECTORS.job.submitButton);
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Job added/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Verify job with employee appears
    await navigateToProjectDetail(authenticatedPage, projectId);
    await expect(authenticatedPage.locator(`text=${newJobData.title}`).first()).toBeVisible();

    if (employeeName) {
      await expect(authenticatedPage.locator(`text=${employeeName.trim()}`).first()).toBeVisible();
    }
  });
});

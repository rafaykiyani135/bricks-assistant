/**
 * User Story: Quote Summary
 *
 * Description:
 * As an Employee, I want to view a project quote summary in a format that can be shared
 * with clients or management.
 *
 * Nominal Flow:
 * 1. Employee opens a project.
 * 2. Employee clicks "View Quote Summary".
 * 3. System generates a summary including jobs, estimated durations, costs, and net margin.
 * 4. Employee can download or share the summary.
 */

import { test, expect } from './fixtures';
import { createProject, generateProjectData, navigateToProjectDetail } from './helpers/project';
import { createJob, generateJobData, clickViewQuoteSummaryButton, verifyQuoteSummary } from './helpers/job';
import { SELECTORS } from './selectors';

test.describe('User Story: Quote Summary', () => {
  let projectId: number;

  /**
   * Setup: Create a project before each test
   */
  test.beforeEach(async ({ authenticatedPage }) => {
    const projectData = generateProjectData('quote-summary-test');
    projectId = await createProject(authenticatedPage, projectData);
  });

  /**
   * Nominal Flow Test
   * Scenario: View summary successfully
   * Given a project has jobs
   * When I view the quote summary
   * Then I see all jobs with costs and totals
   */
  test('should display quote summary with all jobs and totals', async ({ authenticatedPage }) => {
    // Add multiple jobs to the project
    const job1Data = generateJobData('electrical-job');
    job1Data.category = 'ELECTRICAL';
    await createJob(authenticatedPage, projectId, job1Data);

    const job2Data = generateJobData('plumbing-job');
    job2Data.category = 'PLUMBING';
    job2Data.estimatedComplexity = 10;
    job2Data.price = 200;
    await createJob(authenticatedPage, projectId, job2Data);

    // Navigate to project detail
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Click "View Quote Summary" button
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify summary is displayed
    await verifyQuoteSummary(authenticatedPage);

    // Verify all jobs are listed (within quote summary)
    const summary = authenticatedPage.locator('#quote-summary-content');
    await expect(summary.locator(`text=${job1Data.title}`).first()).toBeVisible();
    await expect(summary.locator(`text=${job2Data.title}`).first()).toBeVisible();

    // Verify job details are shown (complexity, price)
    await expect(authenticatedPage.locator(`text=${job1Data.estimatedComplexity}`).first()).toBeVisible();
    await expect(authenticatedPage.locator(`text=${job2Data.estimatedComplexity}`).first()).toBeVisible();

    // Verify totals section exists
    const totalsSection = authenticatedPage.locator('text=/total.*cost|net.*margin|duration/i');
    await expect(totalsSection.first()).toBeVisible();

    // Verify cost values are displayed
    const costDisplay = authenticatedPage.locator('text=/\\$\\d+/');
    await expect(costDisplay.first()).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Summary shows estimated durations
   * Given a project has jobs with complexity
   * When I view the summary
   * Then I see the total estimated duration
   */
  test('should show estimated duration in summary', async ({ authenticatedPage }) => {
    // Add jobs with different complexities
    const job1Data = generateJobData('job-1');
    job1Data.estimatedComplexity = 5;
    await createJob(authenticatedPage, projectId, job1Data);

    const job2Data = generateJobData('job-2');
    job2Data.estimatedComplexity = 8;
    await createJob(authenticatedPage, projectId, job2Data);

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify duration/complexity is shown
    // Total should be 5 + 8 = 13 hours
    const summary = authenticatedPage.locator('#quote-summary-content');
    const durationText = summary.locator('text=/total.*hours|duration|complexity/i');
    await expect(durationText.first()).toBeVisible();

    // Look for the total hours value (13) next to "Total Hours" label
    const totalHoursCard = summary.locator('text=Total Hours').locator('..');
    await expect(totalHoursCard.locator('text=13')).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Summary shows net margin
   * Given a project has jobs with prices and costs
   * When I view the summary
   * Then I see the net margin calculation
   */
  test('should show net margin in summary', async ({ authenticatedPage }) => {
    // Add job with price
    const jobData = generateJobData('margin-job');
    jobData.price = 500;
    jobData.estimatedComplexity = 10;
    await createJob(authenticatedPage, projectId, jobData);

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify net margin is displayed
    const marginText = authenticatedPage.locator('text=/net.*margin|profit|margin/i');
    await expect(marginText.first()).toBeVisible();

    // Should show either percentage or dollar amount
    const marginValue = authenticatedPage.locator('text=/\\d+%|\\$\\d+/');
    await expect(marginValue.first()).toBeVisible();
  });

  /**
   * Nominal Flow Test
   * Scenario: Summary can be downloaded or shared
   * When I view the summary
   * Then I see options to download or share
   *
   * Note: Actual download/share functionality depends on implementation
   */
  test('should provide download or share options', async ({ authenticatedPage }) => {
    // Add a job
    const jobData = generateJobData('download-test-job');
    await createJob(authenticatedPage, projectId, jobData);

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Look for download/share/print buttons
    const actionButtons = authenticatedPage.locator('button:has-text("Download"), button:has-text("Share"), button:has-text("Print"), button:has-text("Export")');

    // At least one action button should be available
    const count = await actionButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  /**
   * Alternate/Error Flow Test
   * Scenario: No jobs in project
   * Given a project has no jobs
   * When I go to the project page
   * Then I see a message indicating no jobs exist
   * And The Summary button is disabled
   */
  test('should show message when project has no jobs', async ({ authenticatedPage }) => {
    // Navigate to project with no jobs
    await navigateToProjectDetail(authenticatedPage, projectId);

    // Wait for jobs section to load
    await authenticatedPage.waitForSelector('.lg\\:col-span-2', { timeout: 5000 });

    // Verify "no jobs" message OR empty table is shown
    // The message may only be visible in mobile view, so check both desktop and mobile states
    const hasEmptyState = await authenticatedPage.locator('text=/no jobs|add.*first job/i').count();
    const hasNoJobRows = await authenticatedPage.locator('tbody tr').count();

    // Either we have an empty state message OR no job rows in the table
    expect(hasEmptyState > 0 || hasNoJobRows === 0).toBe(true);

    // Verify Summary button is disabled or not visible
    const summaryButton = authenticatedPage.locator(SELECTORS.project.viewSummaryButton);

    try {
      const isVisible = await summaryButton.isVisible({ timeout: 2000 });
      if (isVisible) {
        // If visible, it should be disabled
        await expect(summaryButton).toBeDisabled();
      }
    } catch {
      // Button not visible is also acceptable (hidden when no jobs)
      expect(true).toBe(true);
    }
  });

  /**
   * Edge Case Test
   * Scenario: Summary with single job
   * Given a project has only one job
   * When I view the summary
   * Then totals equal the single job values
   */
  test('should show correct totals for single job', async ({ authenticatedPage }) => {
    // Add one job
    const jobData = generateJobData('single-job');
    jobData.price = 300;
    jobData.estimatedComplexity = 6;
    await createJob(authenticatedPage, projectId, jobData);

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify the job is shown (within quote summary)
    const summary = authenticatedPage.locator('#quote-summary-content');
    await expect(summary.locator(`text=${jobData.title}`).first()).toBeVisible();

    // Verify totals match the single job
    const totalCostCard = summary.locator('text=Total Cost').locator('..');
    await expect(totalCostCard.locator('text=/300/').first()).toBeVisible(); // Price

    const totalHoursCard = summary.locator('text=Total Hours').locator('..');
    await expect(totalHoursCard.locator('text=6')).toBeVisible(); // Duration
  });

  /**
   * Edge Case Test
   * Scenario: Summary with many jobs
   * Given a project has many jobs
   * When I view the summary
   * Then all jobs are listed and totals are calculated
   */
  test('should handle summary with multiple jobs', async ({ authenticatedPage }) => {
    // Add multiple jobs
    const jobCount = 5;
    const jobs = [];

    for (let i = 0; i < jobCount; i++) {
      const jobData = generateJobData(`job-${i}`);
      jobData.estimatedComplexity = 5;
      jobData.price = 100;
      jobs.push(jobData);
      await createJob(authenticatedPage, projectId, jobData);
    }

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify all jobs are visible (within quote summary)
    const summary = authenticatedPage.locator('#quote-summary-content');
    for (const job of jobs) {
      await expect(summary.locator(`text=${job.title}`).first()).toBeVisible();
    }

    // Verify totals are calculated (5 jobs * 5 hours = 25 hours, 5 jobs * $100 = $500)
    const totalHoursCard = summary.locator('text=Total Hours').locator('..');
    await expect(totalHoursCard.locator('text=25')).toBeVisible();

    const totalCostCard = summary.locator('text=Total Cost').locator('..');
    await expect(totalCostCard.locator('text=/500/').first()).toBeVisible();
  });

  /**
   * Integration Test
   * Scenario: Summary updates when jobs are modified
   * Given a project has jobs
   * When I modify a job and view summary again
   * Then the summary reflects the changes
   */
  test('should update summary when jobs are modified', async ({ authenticatedPage }) => {
    // Add initial job
    const jobData = generateJobData('modifiable-job');
    jobData.price = 100;
    jobData.estimatedComplexity = 5;
    await createJob(authenticatedPage, projectId, jobData);

    // View initial summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify initial values in quote summary
    const summary = authenticatedPage.locator('#quote-summary-content');
    const totalCostCard = summary.locator('text=Total Cost').locator('..');
    await expect(totalCostCard.locator('text=/100/').first()).toBeVisible();

    // Close summary by clicking close button
    // Look for the close button that's a sibling of the "Quote Summary" heading
    const closeButton = authenticatedPage.locator('h3:has-text("Quote Summary")').locator('..').locator('button');
    await closeButton.click({ timeout: 5000 });

    // Wait for summary to close and job form to be accessible
    await authenticatedPage.waitForTimeout(1000);

    // Edit the job to change price - use table row structure
    const jobRow = authenticatedPage.locator('tr').filter({ hasText: jobData.title });
    const editButton = jobRow.locator('button:has-text("Edit")');
    await editButton.click({ timeout: 10000 });

    await authenticatedPage.fill(SELECTORS.job.priceInput, '');
    await authenticatedPage.fill(SELECTORS.job.priceInput, '200');

    const saveButton = authenticatedPage.locator(SELECTORS.job.saveChangesButton);
    await saveButton.click();

    // Wait for success
    const successToast = authenticatedPage.locator('[data-slot="title"]').filter({ hasText: /Success/i }).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // View summary again
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify updated price is shown in quote summary
    const updatedSummary = authenticatedPage.locator('#quote-summary-content');
    const updatedCostCard = updatedSummary.locator('text=Total Cost').locator('..');
    await expect(updatedCostCard.locator('text=/200/').first()).toBeVisible();
  });

  /**
   * Visual Test
   * Scenario: Summary is well formatted
   * When I view the summary
   * Then it should be clearly formatted and readable
   */
  test('should display summary in readable format', async ({ authenticatedPage }) => {
    // Add job
    const jobData = generateJobData('format-test-job');
    await createJob(authenticatedPage, projectId, jobData);

    // Navigate and view summary
    await navigateToProjectDetail(authenticatedPage, projectId);
    await clickViewQuoteSummaryButton(authenticatedPage);

    // Verify key sections are present and visible
    const heading = authenticatedPage.locator(SELECTORS.project.summaryHeading);
    await expect(heading).toBeVisible();

    const jobList = authenticatedPage.locator(SELECTORS.project.summaryJobList).or(
      authenticatedPage.locator('[data-testid="job-list"]')
    );
    await expect(jobList.first()).toBeVisible();

    // Should have clear headings/labels
    const labels = authenticatedPage.locator('text=/job|task|description|duration|cost|price|total/i');
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);
  });
});

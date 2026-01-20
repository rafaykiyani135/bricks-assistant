import { Page, expect } from '@playwright/test';
import { SELECTORS, TEXT_CONTENT, URLS } from '../selectors';

export interface ProjectData {
  name: string;
  client: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Navigate to new project page
 */
export async function navigateToNewProject(page: Page) {
  await page.goto(URLS.projectsNew);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/.*\/projects\/new/);
}

/**
 * Fill project form
 */
export async function fillProjectForm(page: Page, data: ProjectData) {
  // Fill basic fields
  await page.fill(SELECTORS.project.nameInput, data.name);
  await page.fill(SELECTORS.project.clientInput, data.client);

  // Fill dates if provided
  if (data.startDate) {
    await page.fill(SELECTORS.project.startDateInput, data.startDate);
  }

  if (data.endDate) {
    await page.fill(SELECTORS.project.endDateInput, data.endDate);
  }
}

/**
 * Create a project with the given data
 * Returns the project ID after creation
 */
export async function createProject(page: Page, data: ProjectData): Promise<number> {
  await navigateToNewProject(page);
  await fillProjectForm(page, data);

  // Submit form
  const createButton = page.locator(SELECTORS.project.createButton);
  await expect(createButton).toBeEnabled();
  await createButton.click();

  // Wait for automatic redirect to project detail page
  await page.waitForURL(/.*\/projects\/\d+/, { timeout: 10000 });

  // Wait for success toast to confirm creation
  const successToast = page.locator('[data-slot="title"]').filter({ hasText: 'Project created!' }).first();
  await expect(successToast).toBeVisible({ timeout: 10000 });

  // Extract project ID from URL
  const url = page.url();
  const match = url.match(/\/projects\/(\d+)/);

  if (match) {
    return parseInt(match[1]);
  }

  throw new Error('Failed to extract project ID from URL after creation');
}

/**
 * Generate test project data
 */
export function generateProjectData(suffix?: string): ProjectData {
  const timestamp = Date.now();
  const id = suffix || timestamp;

  return {
    name: `Test Project ${id}`,
    client: `Test Client ${id}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: getDateInFuture(60).toISOString().split('T')[0],
  };
}

/**
 * Helper to get a date in the future
 */
function getDateInFuture(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Navigate to projects list
 */
export async function navigateToProjects(page: Page) {
  await page.goto(URLS.projects);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/.*\/projects/);
}

/**
 * Verify project appears in list
 */
export async function verifyProjectInList(page: Page, projectName: string) {
  await navigateToProjects(page);
  const projectCard = page.locator(`text=${projectName}`);
  await expect(projectCard).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to project detail page
 */
export async function navigateToProjectDetail(page: Page, projectId: number) {
  await page.goto(`${URLS.projects}/${projectId}`);
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(new RegExp(`.*\/projects\/${projectId}`));
}

import { test as baseTest, expect, Page } from '@playwright/test';
import { AuthHelper, NavigationHelper, ProjectHelper, DashboardHelper } from '../utils/helpers';

type TestFixtures = {
  authHelper: AuthHelper;
  navigationHelper: NavigationHelper;
  projectHelper: ProjectHelper;
  dashboardHelper: DashboardHelper;
  authenticatedPage: Page; // Page que ya está autenticada
};

export const test = baseTest.extend<TestFixtures>({
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },

  navigationHelper: async ({ page }, use) => {
    await use(new NavigationHelper(page));
  },

  projectHelper: async ({ page }, use) => {
    await use(new ProjectHelper(page));
  },

  dashboardHelper: async ({ page }, use) => {
    await use(new DashboardHelper(page));
  },

  // Fixture que proporciona una página ya autenticada
  authenticatedPage: async ({ page, authHelper }, use) => {
    await authHelper.login();
    await use(page);
    // Cleanup se hace automáticamente cuando termina el test
  }
});

export { expect } from '@playwright/test';
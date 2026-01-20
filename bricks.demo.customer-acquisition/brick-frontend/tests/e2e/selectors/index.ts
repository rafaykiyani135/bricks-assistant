/**
 * Centralized selectors for E2E tests
 * Keeps selectors in one place for easy maintenance
 */

export const SELECTORS = {
  // Auth/Login
  auth: {
    emailInput: 'input#email',
    passwordInput: 'input#password',
    submitButton: 'button[type="submit"]',
    demoCredentialsButton: '#demo-credentials-btn',
  },

  // Project Form
  project: {
    nameInput: '#project-name',
    clientInput: '#project-client',
    startDateInput: '#project-start-date',
    endDateInput: '#project-end-date',
    createButton: 'button:has-text("Create Project Quote")',
    newProjectButton: 'button:has-text("New Project Quote")',
    nameLabel: 'label[for="project-name"]',
    clientLabel: 'label[for="project-client"]',
    editButton: 'button:has-text("Edit Project")',
    saveButton: 'button:has-text("Save")',
    totalCost: '[data-testid="total-cost"]',
    netMargin: '[data-testid="net-margin"]',
    duration: '[data-testid="duration"]',
    viewSummaryButton: 'button:has-text("View Quote Summary")',
    summaryHeading: 'h2:has-text("Quote Summary")',
    summaryJobList: '[data-testid="summary-job-list"]',
    noJobsMessage: 'text=No jobs exist',
  },

  // Toast notifications
  toast: {
    title: '[data-slot="title"]',
    projectCreatedSuccess: '[data-slot="title"]:text-is("Project created!")',
    // Alternative selector that's more specific
    projectCreatedSuccessAlt: 'div[data-slot="title"]:has-text("Project created!")',
  },

  // Common page elements
  common: {
    h1: 'h1',
    h2: 'h2',
    form: 'form',
  },

  // Dashboard
  dashboard: {
    welcome: 'h1:has-text("Welcome to Brick Job Costing")',
    newProjectButton: 'button:has-text("New Project")',
  },

  // Projects page
  projects: {
    heading: 'h1:has-text("Projects")',
    projectCard: '[data-testid="project-card"]',
  },

  // Job Form
  job: {
    addJobButton: 'button:has-text("Add Job")',
    titleInput: '#job-title',
    categorySelect: '#job-category',
    complexityInput: '#job-complexity',
    priceInput: '#job-price',
    employeeSelect: '#job-employee',
    submitButton: 'button[type="submit"]:has-text("Add Job")',
    saveChangesButton: 'button:has-text("Save Changes")',
    editButton: 'button:has-text("Edit")',
    deleteButton: 'button:has-text("Delete")',
  },
};

/**
 * Common text content used in tests
 */
export const TEXT_CONTENT = {
  pages: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    newProject: 'New Project Quote',
  },
  buttons: {
    createProject: 'Create Project Quote',
    newProject: 'New Project Quote',
    cancel: 'Cancel',
  },
  labels: {
    projectName: 'Project Name',
    client: 'Client',
  },
  messages: {
    projectCreated: 'Project created!',
    loading: 'Loading',
  },
};

/**
 * Common URLs used in tests
 */
export const URLS = {
  home: '/',
  login: '/login',
  dashboard: '/dashboard',
  projects: '/projects',
  projectsNew: '/projects/new',
  health: '/health',
};

/**
 * Test data generators and constants
 */
export const TEST_DATA = {
  demoUser: {
    email: 'juan.admin@brickcode.com',
    password: 'admin123',
  },
};

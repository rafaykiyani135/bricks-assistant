import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  // Credenciales válidas del seed
  static readonly USERS = {
    admin: { email: 'juan.admin@brickcode.com', password: 'admin123' },
    tech: { email: 'maria.tech@brickcode.com', password: 'tech123' },
    manager: { email: 'carlos.manager@brickcode.com', password: 'manager123' },
    employee: { email: 'ana.employee@brickcode.com', password: 'employee123' }
  };

  async login(role: 'admin' | 'tech' | 'manager' | 'employee' = 'admin') {
    const credentials = AuthHelper.USERS[role];
    
    // Navegar a la página de login
    await this.page.goto('/login');
    
    // Verificar que estamos en la página de login
    await expect(this.page).toHaveURL(/.*\/login/);
    
    // Llenar el formulario de login
    await this.page.fill('input[type="email"]', credentials.email);
    await this.page.fill('input[type="password"]', credentials.password);
    
    // Hacer clic en el botón de login
    await this.page.click('button[type="submit"]');
    
    // Esperar a que la navegación se complete
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForURL(/.*\/dashboard|.*\/$/);
    
    // Verificar que estamos logueados (el header debe estar visible)
    await expect(this.page.locator('nav')).toBeVisible();
  }

  async logout() {
    // Si hay un botón de logout, hacer clic en él
    const logoutButton = this.page.locator('button:has-text("Logout"), button:has-text("Salir")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
    
    // Verificar que estamos en login o home
    await expect(this.page).toHaveURL(/.*\/login|.*\/$/);
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  async goToDashboard() {
    await this.page.click('a[href="/dashboard"]');
    await expect(this.page).toHaveURL(/.*\/dashboard/);
    await expect(this.page.locator('h1:has-text("Dashboard")')).toBeVisible();
  }

  async goToProjects() {
    await this.page.click('a[href="/projects"]');
    await expect(this.page).toHaveURL(/.*\/projects/);
  }

  async goToNewProject() {
    await this.page.click('a[href="/projects/new"]');
    await expect(this.page).toHaveURL(/.*\/projects\/new/);
    await expect(this.page.locator('h1:has-text("Nuevo Proyecto")')).toBeVisible();
  }

  async goToProject(projectId: number) {
    await this.page.goto(`/projects/${projectId}`);
    await expect(this.page).toHaveURL(new RegExp(`.*\/projects\/${projectId}`));
  }
}

export class ProjectHelper {
  constructor(private page: Page) {}

  async createProject(projectData: {
    name: string;
    client: string;
    startDate: string;
    estimatedEndDate: string;
  }) {
    // Llenar formulario de proyecto
    await this.page.fill('input[name="name"]', projectData.name);
    await this.page.fill('input[name="client"]', projectData.client);
    await this.page.fill('input[name="startDate"]', projectData.startDate);
    await this.page.fill('input[name="estimatedEndDate"]', projectData.estimatedEndDate);
    
    // Enviar formulario
    await this.page.click('button[type="submit"]');
    
    // Esperar confirmación o redirección
    await this.page.waitForLoadState('networkidle');
  }

  async addJob(jobData: {
    title: string;
    category: string;
    estimatedComplexity: number;
    price: number;
    employeeId?: number;
  }) {
    // Hacer clic en agregar trabajo
    await this.page.click('button:has-text("Agregar Trabajo")');
    
    // Esperar que aparezca el modal/formulario
    await expect(this.page.locator('h3:has-text("Agregar Nuevo Trabajo")')).toBeVisible();
    
    // Llenar formulario de trabajo
    await this.page.fill('input[id="job-title"]', jobData.title);
    await this.page.selectOption('select[id="job-category"]', jobData.category);
    await this.page.fill('input[id="job-complexity"]', jobData.estimatedComplexity.toString());
    await this.page.fill('input[id="job-price"]', jobData.price.toString());
    
    if (jobData.employeeId) {
      await this.page.selectOption('select[id="job-employee"]', jobData.employeeId.toString());
    }
    
    // Enviar formulario
    await this.page.click('button[type="submit"]:has-text("Crear Trabajo")');
    
    // Esperar que el modal se cierre y se actualice la lista
    await this.page.waitForLoadState('networkidle');
  }

  async openQuoteSummary() {
    await this.page.click('button:has-text("Ver Resumen"), button:has-text("View Quote Summary")');
    await expect(this.page.locator('h2:has-text("Resumen de Cotización"), h2:has-text("Quote Summary")')).toBeVisible();
  }

  async printQuoteSummary() {
    // Escuchar el evento de impresión
    let printTriggered = false;
    this.page.on('dialog', async dialog => {
      if (dialog.type() === 'beforeprint') {
        printTriggered = true;
      }
      await dialog.accept();
    });

    await this.page.click('button:has-text("Print"), button:has-text("Imprimir")');
    
    // Verificar que se activó la funcionalidad de impresión
    return printTriggered;
  }
}

export class DashboardHelper {
  constructor(private page: Page) {}

  async waitForProjects() {
    // Esperar que se carguen los proyectos
    await this.page.waitForLoadState('networkidle');
    
    // Verificar que no hay estado de carga
    await expect(this.page.locator('text=Cargando proyectos')).not.toBeVisible();
  }

  async sortProjects(sortBy: string) {
    await this.page.selectOption('select', sortBy);
    await this.page.waitForLoadState('networkidle');
  }

  async getProjectCount() {
    const countElement = await this.page.locator('[data-testid="project-count"]').first();
    if (await countElement.isVisible()) {
      const text = await countElement.textContent();
      return parseInt(text || '0');
    }
    return 0;
  }

  async clickProjectCard(projectId: number) {
    await this.page.click(`[data-project-id="${projectId}"]`);
    await expect(this.page).toHaveURL(new RegExp(`.*\/projects\/${projectId}`));
  }
}

// Datos de prueba comunes
export const TEST_DATA = {
  projects: {
    simple: {
      name: 'Proyecto Test E2E',
      client: 'Cliente Test',
      startDate: '2024-01-01',
      estimatedEndDate: '2024-03-01'
    },
    complex: {
      name: 'Proyecto Complejo E2E',
      client: 'Cliente Premium',
      startDate: '2024-02-01',
      estimatedEndDate: '2024-06-01'
    }
  },
  jobs: {
    electrical: {
      title: 'Instalación eléctrica',
      category: 'ELECTRICAL',
      estimatedComplexity: 8,
      price: 1500
    },
    plumbing: {
      title: 'Instalación de tuberías',
      category: 'PLUMBING',
      estimatedComplexity: 6,
      price: 1200
    },
    painting: {
      title: 'Pintura de paredes',
      category: 'PAINTING',
      estimatedComplexity: 4,
      price: 800
    }
  }
};
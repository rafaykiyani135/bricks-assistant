# E2E Tests - Playwright

## Estructura del Proyecto

```
tests/e2e/
├── helpers/           # Funciones reutilizables
│   ├── auth.ts       # Helpers de autenticación
│   └── project.ts    # Helpers de proyectos
├── fixtures/         # Fixtures de Playwright
│   └── index.ts      # Fixture de página autenticada
├── selectors/        # Selectores centralizados
│   └── index.ts      # Todos los selectores
├── *.spec.ts         # Tests originales
└── *.refactored.spec.ts  # Tests refactorizados (ejemplos)
```

## Mejoras Implementadas

### 1. **Configuración Optimizada** (`playwright.config.ts`)
- ✅ Timeouts configurados apropiadamente
- ✅ WebServer automático habilitado
- ✅ Reporters configurados para CI/local
- ✅ Retry configurado para mayor estabilidad
- ✅ Setup para autenticación global (comentado, opcional)

### 2. **Helpers Reutilizables**

#### Auth Helpers (`helpers/auth.ts`)
```typescript
import { loginWithDemoButton } from './helpers/auth';

// En tu test
await loginWithDemoButton(page);
```

#### Project Helpers (`helpers/project.ts`)
```typescript
import { createProject, generateProjectData } from './helpers/project';

// En tu test
const projectData = generateProjectData();
await createProject(page, projectData);
```

### 3. **Fixtures Personalizadas** (`fixtures/index.ts`)

Usa `authenticatedPage` para tests que requieren autenticación:

```typescript
import { test, expect } from './fixtures';

test('my test', async ({ authenticatedPage }) => {
  // Ya estás autenticado!
  await authenticatedPage.goto('/projects');
  // ...
});
```

### 4. **Selectores Centralizados** (`selectors/index.ts`)

```typescript
import { SELECTORS, TEXT_CONTENT, URLS } from './selectors';

// En lugar de:
await page.fill('#project-name', 'Test');

// Usa:
await page.fill(SELECTORS.project.nameInput, 'Test');
```

## Cómo Usar

### Ejecutar Tests

```bash
# Todos los tests
npm run test:e2e

# Con UI
npm run test:e2e:ui

# Con headed browser
npm run test:e2e:headed

# Test específico
npx playwright test auth-navigation
```

### Escribir Nuevos Tests

#### Opción 1: Test Simple (sin autenticación)
```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  // ...
});
```

#### Opción 2: Test con Autenticación Manual
```typescript
import { test, expect } from '@playwright/test';
import { loginWithDemoButton } from './helpers/auth';

test('my test', async ({ page }) => {
  await loginWithDemoButton(page);
  // Ya autenticado, continuar con el test
});
```

#### Opción 3: Test con Fixture Autenticada (RECOMENDADO)
```typescript
import { test, expect } from './fixtures';

test('my test', async ({ authenticatedPage }) => {
  // Ya autenticado automáticamente
  await authenticatedPage.goto('/projects');
  // ...
});
```

## Mejores Prácticas

### 1. **Usar Selectores Centralizados**
✅ **Bien:**
```typescript
import { SELECTORS } from './selectors';
await page.fill(SELECTORS.project.nameInput, 'Test');
```

❌ **Mal:**
```typescript
await page.fill('#project-name', 'Test');
```

### 2. **Usar Helpers para Acciones Comunes**
✅ **Bien:**
```typescript
import { loginWithDemoButton } from './helpers/auth';
await loginWithDemoButton(page);
```

❌ **Mal:**
```typescript
await page.goto('/login');
await page.fill('#email', 'test@test.com');
await page.fill('#password', 'password');
await page.click('button[type="submit"]');
// ... más código repetitivo
```

### 3. **Usar Fixtures para Estados Comunes**
✅ **Bien:**
```typescript
test('my test', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/projects');
});
```

❌ **Mal:**
```typescript
test('my test', async ({ page }) => {
  // Repetir login en cada test
  await page.goto('/login');
  await page.fill(...);
  // ...
});
```

### 4. **Esperas Apropiadas**
✅ **Bien:**
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 10000 });
```

❌ **Mal:**
```typescript
await page.waitForTimeout(5000); // Evitar esperas fijas
```

### 5. **Generación de Datos de Test**
✅ **Bien:**
```typescript
import { generateProjectData } from './helpers/project';
const data = generateProjectData();
```

❌ **Mal:**
```typescript
const name = 'Test Project 123'; // Puede causar conflictos
```

## Debugging

### Ver Tests en UI Mode
```bash
npm run test:e2e:ui
```

### Ver Trace de Tests Fallidos
```bash
npx playwright show-trace trace.zip
```

### Debug con Headed Browser
```bash
npm run test:e2e:headed
```

### Debug con Inspector
```bash
npx playwright test --debug
```

### Problemas Comunes

Si encuentras errores, consulta la [Guía de Troubleshooting](TROUBLESHOOTING.md) que incluye:
- Soluciones a errores comunes
- Tips de debugging
- Problemas de performance
- Y más...

## Migración de Tests Antiguos

Los tests originales permanecen sin cambios. Los archivos `*.refactored.spec.ts` son ejemplos de cómo usar las nuevas utilidades.

Para migrar un test:

1. Importa los helpers necesarios
2. Reemplaza código duplicado con helpers
3. Usa selectores centralizados
4. Considera usar fixtures si el test requiere autenticación

## Próximos Pasos

- [ ] Migrar tests restantes a usar helpers
- [ ] Implementar autenticación global con `storageState` (opcional)
- [ ] Agregar más helpers según necesidad
- [ ] Agregar tests de API si es necesario
- [ ] Configurar CI/CD con Playwright

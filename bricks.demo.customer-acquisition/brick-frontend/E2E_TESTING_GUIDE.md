# E2E Testing Guide - Comprehensive Test Suite

## 🎯 Current Status
✅ **Playwright fully configured and functional**
✅ **Complete authentication and navigation tests**
✅ **Project management workflow tests**
✅ **Job management CRUD operations tests**
✅ **Quote summary generation and export tests**
✅ **Dashboard workflow and filtering tests**
✅ **Complete business workflow integration tests**
✅ **System configuration and performance tests**

## 📋 Prerequisites for Complete Testing

### 1. Backend Server (Required)
```bash
cd server
npm run start:dev
# Backend must be running on http://localhost:3000
```

### 2. Frontend Server (Already configured)
```bash
cd client
npm run dev -- --port 3001
# Frontend runs on http://localhost:3001
```

## 🚀 Testing Commands

### Basic Tests (No Backend Required)
```bash
# Server connectivity test
npx playwright test server-connection.spec.ts

# Login debug test (diagnoses issues)
npx playwright test debug-login.spec.ts --headed
```

### Complete Tests (Backend Required)
```bash
# Authentication and navigation tests
npx playwright test auth-navigation.spec.ts --headed

# Project creation and management
npx playwright test project-creation.spec.ts --headed

# Job management workflows
npx playwright test job-management.spec.ts --headed

# Quote summary generation
npx playwright test quote-summary.spec.ts --headed

# Dashboard workflows
npx playwright test dashboard-workflow.spec.ts --headed

# Complete business workflows
npx playwright test complete-workflows.spec.ts --headed

# System configuration tests
npx playwright test system-config.spec.ts --headed

# All tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

## 🔧 Configuración de Credenciales
```typescript
// Credenciales configuradas en todos los tests:
email: "juan@gmail.com"
password: "1234"
```

## 📊 Tests Disponibles

### 1. **server-connection.spec.ts**
- Verifica conectividad del frontend
- Detecta si el servidor está ejecutándose
- No requiere backend

### 2. **debug-login.spec.ts** 
- Diagnostica problemas de login
- Captura screenshots en cada paso
- Detecta errores de red y backend
- Logging detallado

### 3. **auth-navigation.spec.ts**
- Test completo de autenticación
- Navegación post-login
- Acceso a páginas protegidas
- **Requiere backend ejecutándose**

### 4. **project-creation.spec.ts**
- Workflow completo: Login → Crear Proyecto → Validar
- Test de formularios y validación
- Navegación entre páginas
- **Requiere backend ejecutándose**

## 🎯 Próximos Tests Pendientes

### Tests de Workflows de Negocios
1. **Agregar trabajos workflow** - Agregar jobs a proyectos existentes
2. **Quote Summary workflow** - Generar y exportar cotizaciones
3. **Dashboard workflow** - Navegación y métricas del dashboard

### Configuración CI/CD
- Setup para ejecutar tests automáticamente
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing

## 🔍 Debugging

### Si los tests fallan:
1. **Verificar backend**: `curl http://localhost:3000/graphql`
2. **Verificar frontend**: Abrir `http://localhost:3001/login`
3. **Ver screenshots**: Generados automáticamente en `test-results/`
4. **Ver videos**: Grabación de tests fallidos en `test-results/`
5. **Ver reporte HTML**: `npx playwright show-report`

### Logs útiles:
- Browser console logs capturados automáticamente
- Network request failures detectados
- Screenshots antes/después de acciones críticas

## 📝 Configuración Técnica

### Puertos:
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000` (GraphQL)

### Browsers soportados:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Chrome Mobile (Pixel 5)
- Safari Mobile (iPhone 12)

### Configuración de esperas:
- Login: 3-4 segundos después del submit
- Navegación: `networkidle` + timeouts adicionales
- Formularios: Validación automática de campos

---

**✅ READY FOR FULL E2E TESTING** - Solo necesita backend ejecutándose para tests completos
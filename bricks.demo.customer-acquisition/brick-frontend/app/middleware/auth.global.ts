// Middleware global de auth. Se ejecuta tanto en SSR como en cliente.
// Evitamos acceder a APIs del navegador cuando estamos en el servidor.
export default defineNuxtRouteMiddleware((to) => {
  // Leemos cookie principal (compatible SSR) y fallback a localStorage si existe.
  const authCookie = useCookie<string | null>('auth_token');
  let token: string | null = authCookie.value;
  if (!token && process.client) {
    try {
      token = localStorage.getItem('token');
    } catch (e) {
      console.warn('[auth.middleware] localStorage inaccessibile:', e);
    }
  }

  const isAuthenticated = Boolean(token);

  // Si no está autenticado y no está en /login, redirigimos.
  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }

  // Si ya está autenticado y entra a /login, lo mandamos al home.
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/');
  }
});

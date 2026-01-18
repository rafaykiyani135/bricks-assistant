export default defineNuxtRouteMiddleware(async (to, _from) => {
  const auth = useAuthStore();
  if (auth.accessToken || auth.isInitializing) return;

  const publicRoutes = ['/auth/login', '/auth/register', '/auth/success'];
  if (publicRoutes.includes(to.path)) return;

  return navigateTo('/auth/login');
});

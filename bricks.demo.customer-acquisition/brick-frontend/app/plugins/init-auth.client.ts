export default defineNuxtPlugin(async () => {
  const auth = useAuthStore();
  const route = useRoute();

  if (route.path === '/auth/success') return;

  auth.initAuth();
});

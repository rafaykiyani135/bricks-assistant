import { defineStore } from 'pinia';

type User = {
  id: string;
  email: string;
  name: string;
};

const API_BASE = 'http://localhost:3001';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | User,
    accessToken: null as string | null,
    isInitializing: false,
  }),

  actions: {
    setAuth(user: User, token: string) {
      this.user = user;
      this.accessToken = token;
    },

    async logout() {
      try {
        await $fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        console.log('Logout failed');
      } finally {
        this.user = null;
        this.accessToken = null;
        navigateTo('/auth/login');
      }
    },

    async initAuth() {
      this.isInitializing = true;
      try {
        const res = await $fetch<{ accessToken: string; user: User }>(
          `${API_BASE}/auth/refresh`,
          {
            credentials: 'include',
          },
        );

        this.accessToken = res.accessToken;
        this.user = res.user;
      } catch {
        this.logout();
      } finally {
        this.isInitializing = false;
      }
    },
  },
});

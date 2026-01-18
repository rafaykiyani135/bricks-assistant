<template>
  <div class="flex h-screen w-full items-center justify-center">
    <div class="space-y-2 text-center">
      <p class="text-lg font-semibold">Logging in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useAuthStore } from '~/stores/auth';

  const API_BASE = 'http://localhost:3001';

  const loading = ref(true);
  const errorMessage = ref('');

  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();

  const fetchAuthData = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
      const accessToken = route.query.accessToken;
      if (typeof accessToken !== 'string') {
        throw new Error('Missing access token');
      }

      const profileResponse = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Cannot get user information');
      }

      const data = await profileResponse.json();
      const user = data?.user;
      if (!user) {
        throw new Error('User not found');
      }

      authStore.setAuth(
        {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        accessToken,
      );

      await router.replace('/');
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : 'An unknown error occurred';
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchAuthData);
</script>

<template>
  <UApp>
    <ArkHeader></ArkHeader>
    <UMain>
      <NuxtLayout>
        <AppLoading v-if="auth.isInitializing" />
        <NuxtPage v-else />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
  import AppLoading from './components/AppLoading.vue';
  import ArkHeader from './components/ArkHeader.vue';
  import { useAuthStore } from './stores/auth';

  const auth = useAuthStore();
</script>

<style>
  @import 'tailwindcss';
  @import '@nuxt/ui';
</style>


<template>
  <UApp>
    <BrkHeader :isLoggedIn="false" />
    <UMain>
      <NuxtLayout>
        <NuxtPage />
        <!-- The content of your brick would go here -->
        <BrkSection />
        <BrkCard />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>

<script setup lang="ts">
  import BrkHeader from './components/BrkHeader.vue';
</script>
<script setup lang="ts">
  import { computed } from 'vue';
  import { useAuthStore } from '~/stores/auth';
  import { useRoute } from 'vue-router';
  import type { NavigationMenuItem } from '@nuxt/ui';
  import ThemeSelector from './ThemeSelector.vue';

  const auth = useAuthStore();
  const route = useRoute();

  // Generate avatar URL using DiceBear API
  const avatarUrl = computed(() => {
    if (!auth.user) return '';
    // Use email as seed for consistent avatar generation
    const seed = auth.user.email || auth.user.name || 'default';
    // Acceptable: 'identicon','avataaars', 'bottts', 'personas', etc.
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  });

  const items = computed<NavigationMenuItem[]>(() => [
    {
      label: 'Dashboard',
      to: '/dashboard',
      active: route.path.startsWith('/dashboard'),
    },
    {
      label: 'Customers',
      to: '/customers',
      active: route.path.startsWith('/customers'),
    },
  ]);

  const dropdownItems = computed(() => {
    if (!auth.user) return [];
    return [
      {
        label: auth.user.name,
        description: auth.user.email,
        disabled: true,
      },
      {
        type: 'separator' as const,
      },
      {
        label: 'Log out',
        icon: 'i-lucide-log-out',
        onSelect: () => auth.logout(),
      },
    ];
  });
</script>

<template>
  <UHeader>
    <template #title>
      <span class="text-primary">Brickcode</span>
    </template>
    <UNavigationMenu v-if="auth.user" :items="items" />
    <template #right>
      <ThemeSelector />
      <UDropdownMenu
        v-if="auth.user"
        :items="dropdownItems"
        :content="{
          align: 'end',
          sideOffset: 8,
        }"
      >
        <button
          class="ring-primary/20 flex size-9 items-center justify-center overflow-hidden rounded-full ring-2 transition hover:opacity-90"
          type="button"
          aria-label="Open user menu"
        >
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            :alt="auth.user.name || 'User avatar'"
            class="size-full object-cover"
          />
        </button>
      </UDropdownMenu>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
  import { useTheme, type Theme } from '~/composables/useTheme';

  const { theme, setTheme } = useTheme();

  const themes: {
    label: string;
    value: Theme;
    color: string;
  }[] = [
    {
      label: 'Red',
      value: 'red',
      color: '#ff7a70',
    },
    {
      label: 'Yellow',
      value: 'yellow',
      color: '#fee433',
    },
    {
      label: 'Blue',
      value: 'blue',
      color: '#64ffff',
    },
    {
      label: 'Green',
      value: 'green',
      color: '#71e673',
    },
  ];

  const handleThemeSelect = (selectedTheme: Theme, close: () => void) => {
    setTheme(selectedTheme);
    close();
  };
</script>

<template>
  <UPopover :ui="{ content: 'w-80 p-3' }">
    <UButton color="primary" variant="ghost" icon="i-lucide-palette" />
    <template #content="{ close }">
      <div class="space-y-4">
        <div class="space-y-2">
          <h3 class="text-xs font-medium text-gray-900 dark:text-white">
            Primary
          </h3>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              v-for="t in themes"
              :key="t.value"
              type="button"
              :class="[
                'relative flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-all',
                theme === t.value
                  ? 'border-primary bg-primary/10 ring-primary ring-1 ring-offset-1'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800',
              ]"
              @click="handleThemeSelect(t.value, close)"
            >
              <div
                class="size-2.5 shrink-0 rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
                :style="{ backgroundColor: t.color }"
              />
              <span class="font-medium text-gray-900 dark:text-white">{{
                t.label
              }}</span>
              <div
                v-if="theme === t.value"
                class="ml-auto flex items-center justify-center"
              >
                <svg
                  class="text-primary size-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </template>
  </UPopover>
</template>

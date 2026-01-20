<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <!-- Welcome Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Brick Job Costing
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Project management and quoting system
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <UCard class="text-center hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/dashboard')">
          <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 class="text-lg font-semibold mb-2">View Dashboard</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Review all your projects and metrics
          </p>
        </UCard>

        <UCard class="text-center hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/projects')">
          <UIcon name="i-heroicons-folder-plus" class="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 class="text-lg font-semibold mb-2">Manage Projects</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Create and manage your projects
          </p>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Brick Job Costing - Project Management System'
})
</script>
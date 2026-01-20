<template>
  <div class="container mx-auto py-6 px-4">
    <div class="mb-6">
      <NuxtLink to="/projects" class="flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Back to Projects
      </NuxtLink>

      <h1 class="text-3xl font-bold text-gray-900">New Project Quote</h1>
      <p class="text-gray-600 mt-2">
        Complete the project details to generate a new quote.
        You can add specific jobs once the project is created.
      </p>
    </div>

    <ProjectForm />
  </div>
</template>

<script setup lang="ts">
import ProjectForm from '~/components/projects/ProjectForm.vue';

// Page metadata
definePageMeta({
  title: 'New Project Quote'
});

// SEO head
useHead({
  title: 'New Project Quote - Job Costing',
  meta: [
    {
      name: 'description',
      content: 'Create a new project quote with client details and estimated dates'
    }
  ]
});
</script>
<template>
  
  <div class="p-4 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="typography-h2 text-gray-900 dark:text-brick-offwhite">Projects</h1>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="toggleForm"
        class="typography-caption"
      >
        {{ showNewProjectForm ? 'Cancel' : 'New Project Quote' }}
      </UButton>
    </div>

    <!-- New project form -->
    <div v-if="showNewProjectForm" class="w-full mb-6">
      <div class="max-w-4xl">
        <ProjectForm @project-created="onProjectCreated" />
      </div>
    </div>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="text-red-600">Error: {{ error.message }}</div>
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="p in projects" :key="p.id" class="flex flex-col">
        <ProjectHeader :project="p" />
        <CostBreakdownCard :project="p" class="mt-2" />
        <NuxtLink :to="`/projects/${p.id}`" class="mt-auto">
          <UButton block color="primary" variant="soft">View details</UButton>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import ProjectHeader from '~/components/projects/ProjectHeader.vue';
import CostBreakdownCard from '~/components/projects/CostBreakdownCard.vue';
import ProjectForm from '~/components/projects/ProjectForm.vue';
import { useProjects } from '~/composables/graphql/useProjects';

const { projects, loading, error, refetch } = useProjects();

// State for showing/hiding the new project form
const showNewProjectForm = ref(false);

// Toggle form visibility
const toggleForm = () => {
  showNewProjectForm.value = !showNewProjectForm.value;
};

// Handle project creation
const onProjectCreated = () => {
  showNewProjectForm.value = false;
  refetch(); // Refresh the projects list
};
</script>
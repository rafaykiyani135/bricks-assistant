<template>
  <div class="flex items-center justify-between mb-4">
    <div class="space-y-1">
      <h1 class="text-xl font-semibold">{{ project?.name }}</h1>
      <p v-if="project?.client" class="text-sm text-gray-500">Client: {{ project.client }}</p>
      <div v-if="project?.startDate || project?.estimatedEndDate" class="flex gap-4 text-xs text-gray-400">
        <span v-if="project.startDate">Start: {{ formatDate(project.startDate) }}</span>
        <span v-if="project.estimatedEndDate">Estimated end: {{ formatDate(project.estimatedEndDate) }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <UButton
        v-if="showEditButton"
        variant="outline"
        size="sm"
        icon="i-heroicons-pencil"
        @click="$emit('edit')"
      >
        Edit Project
      </UButton>
      <UBadge color="primary">Margin: {{ project?.netMargin?.toFixed(2) }}%</UBadge>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { ProjectEntity } from '~/graphql/types';

const props = defineProps<{
  project?: ProjectEntity;
  showEditButton?: boolean;
}>();
defineEmits(['edit']);

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

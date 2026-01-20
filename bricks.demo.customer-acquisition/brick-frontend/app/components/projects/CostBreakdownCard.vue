<template>
  <UCard>
    <div class="flex justify-between mb-2">
      <span class="font-semibold">Costs</span>
      <UBadge color="gray">Total: {{ totalCost?.toFixed(2) }}</UBadge>
    </div>
    <ul class="space-y-1">
      <li v-for="job in jobs" :key="job.id" class="flex justify-between text-sm">
        <span>{{ job.title }}</span>
        <span>{{ job.price.toFixed(2) }}</span>
      </li>
    </ul>
    <div class="mt-3 flex justify-between text-sm">
      <span>Expected Revenue</span>
      <span>{{ expectedRevenue?.toFixed(2) }}</span>
    </div>
    <div class="flex justify-between text-sm">
      <span>Net Margin</span>
      <span>{{ netMargin?.toFixed(2) }}</span>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Job, ProjectEntity } from '~/graphql/types';
const props = defineProps<{ project?: ProjectEntity }>();
const jobs = computed(() => props.project?.jobs || [] as Job[]);
const totalCost = computed(() => props.project?.totalCost || 0);
const expectedRevenue = computed(() => props.project?.expectedRevenue || 0);
const netMargin = computed(() => props.project?.netMargin || 0);
</script>

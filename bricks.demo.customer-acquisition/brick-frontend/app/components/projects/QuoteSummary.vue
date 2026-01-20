<template>
  <UCard class="w-full max-w-4xl mx-auto">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl sm:text-2xl font-bold truncate">Quote Summary</h2>
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">{{ project.name }}</p>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <UButton 
            variant="outline" 
            icon="i-heroicons-printer"
            size="sm"
            @click="printSummary"
            class="flex-1 sm:flex-initial"
          >
            <span class="hidden sm:inline">Print</span>
            <span class="sm:hidden">Print</span>
          </UButton>
          <UButton 
            color="primary" 
            icon="i-heroicons-share"
            size="sm"
            @click="shareSummary"
            class="flex-1 sm:flex-initial"
          >
            <span class="hidden sm:inline">Share</span>
            <span class="sm:hidden">Share</span>
          </UButton>
          <UButton 
            variant="ghost" 
            icon="i-heroicons-x-mark"
            size="sm"
            @click="$emit('close')"
            class="sm:hidden"
          />
        </div>
      </div>
    </template>

    <div id="quote-summary-content" class="space-y-4 sm:space-y-6 print:p-0">
      <!-- Project Information -->
      <div class="border-b pb-4">
        <h3 class="text-base sm:text-lg font-semibold mb-3">Project Information</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
          <div class="space-y-1">
            <p><strong>Project:</strong> {{ project.name }}</p>
            <p><strong>Client:</strong> {{ project.client || 'N/A' }}</p>
          </div>
          <div class="space-y-1">
            <p><strong>Start:</strong> {{ formatDate(project.startDate) }}</p>
            <p><strong>Estimated end:</strong> {{ formatDate(project.estimatedEndDate) }}</p>
          </div>
        </div>
      </div>

      <!-- Jobs Breakdown -->
      <div>
        <h3 class="text-lg font-semibold mb-3">Jobs Breakdown</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse border border-gray-300 dark:border-gray-600">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Job Title</th>
                <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Category</th>
                <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Duration (hrs)</th>
                <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Assigned To</th>
                <th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody data-testid="summary-job-list">
              <tr v-for="job in project.jobs" :key="job.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">{{ job.title }}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {{ formatCategory(job.category) }}
                  </span>
                </td>
                <td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right">{{ job.estimatedComplexity }}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-4 py-2">{{ job.assignedEmployee?.name || 'Unassigned' }}</td>
                <td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right font-medium">${{ job.price?.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Totals -->
      <div class="border-t pt-4">
        <h3 class="text-lg font-semibold mb-3">Summary Totals</h3>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalJobs }}</p>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
            <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ totalHours }}</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${{ totalCost.toFixed(2) }}</p>
          </div>
          <div class="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <p class="text-sm text-gray-600 dark:text-gray-400">Net Margin</p>
            <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{{ netMarginPercentage }}%</p>
          </div>
        </div>
      </div>

      <!-- Financial Breakdown -->
      <div v-if="project.expectedRevenue">
        <h3 class="text-lg font-semibold mb-3">Financial Breakdown</h3>
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
          <div class="flex justify-between">
            <span>Expected Revenue:</span>
            <span class="font-medium">${{ (project.expectedRevenue || 0).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total Project Cost:</span>
            <span class="font-medium">${{ totalCost.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between border-t pt-2 font-bold text-lg">
            <span>Net Margin:</span>
            <span :class="netMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              ${{ netMargin.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div>
        <h3 class="text-lg font-semibold mb-3">Notes</h3>
        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            This quote summary includes all current jobs and estimated costs for the project. 
            Final costs may vary based on actual time required and material costs.
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Generated on {{ formatDateTime(new Date()) }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Props
const props = defineProps<{
  project: {
    id: number;
    name: string;
    client?: string;
    startDate?: string;
    estimatedEndDate?: string;
    expectedRevenue?: number;
    jobs: Array<{
      id: number;
      title: string;
      category: string;
      estimatedComplexity: number;
      price: number;
      assignedEmployee?: {
        id: number;
        name: string;
      };
    }>;
  };
}>();

// Emits
defineEmits<{
  close: [];
}>();

// Computed values
const totalJobs = computed(() => props.project.jobs?.length || 0);

const totalHours = computed(() => {
  return props.project.jobs?.reduce((sum, job) => sum + (job.estimatedComplexity || 0), 0) || 0;
});

const totalCost = computed(() => {
  return props.project.jobs?.reduce((sum, job) => sum + (job.price || 0), 0) || 0;
});

const netMargin = computed(() => {
  return (props.project.expectedRevenue || 0) - totalCost.value;
});

const netMarginPercentage = computed(() => {
  if (!props.project.expectedRevenue || props.project.expectedRevenue === 0) return 0;
  return ((netMargin.value / props.project.expectedRevenue) * 100);
});

// Methods
const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateTime = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCategory = (category: string) => {
  const categoryMap = {
    'ELECTRICAL': 'Electrical',
    'PLUMBING': 'Plumbing',
    'CARPENTRY': 'Carpentry',
    'PAINTING': 'Painting',
    'OTHER': 'Other'
  };
  return categoryMap[category] || category;
};

const printSummary = () => {
  // Focus on the content area for printing
  const printContent = document.getElementById('quote-summary-content');
  if (printContent) {
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Quote Summary - ${props.project.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
              .card { background: #f9f9f9; padding: 15px; border-radius: 8px; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 1.125rem; }
              .text-2xl { font-size: 1.5rem; }
              .mb-3 { margin-bottom: 12px; }
              .mt-2 { margin-top: 8px; }
              .space-y-2 > * + * { margin-top: 8px; }
              .space-y-6 > * + * { margin-top: 24px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  }
};

const shareSummary = async () => {
  const summaryText = `
Quote Summary - ${props.project.name}

Client: ${props.project.client || 'N/A'}
Total Jobs: ${totalJobs.value}
Total Hours: ${totalHours.value}
Total Cost: $${totalCost.value.toFixed(2)}
${props.project.expectedRevenue ? `Net Margin: $${netMargin.value.toFixed(2)} (${netMarginPercentage.value.toFixed(1)}%)` : ''}

Generated on ${formatDateTime(new Date())}
  `;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Quote Summary - ${props.project.name}`,
        text: summaryText,
      });
    } catch (error) {
      // Fall back to copying to clipboard
      await copyToClipboard(summaryText);
    }
  } else {
    await copyToClipboard(summaryText);
  }
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
    console.log('Summary copied to clipboard');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};
</script>

<style scoped>
@media print {
  .print\:p-0 {
    padding: 0 !important;
  }
}
</style>
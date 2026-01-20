<template>
  <div class="p-4 md:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <div>
        <h1 class="typography-h2 text-gray-900 dark:text-brick-offwhite">Dashboard</h1>
        <p class="typography-caption text-gray-600 dark:text-brick-offwhite/70 mt-1">
          Summary of all projects and quotes
        </p>
      </div>
      
      <!-- Controls -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        <!-- Filter controls -->
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <UIcon name="i-heroicons-funnel" class="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select 
            v-model="sortBy"
            class="flex-1 sm:flex-initial px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:min-w-48 lg:min-w-64"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- New project button -->
        <UButton 
          icon="i-heroicons-plus" 
          @click="navigateTo('/projects/new')"
          color="primary"
          size="sm"
          class="w-full sm:w-auto"
        >
          New Project
        </UButton>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      <UCard class="text-center p-4">
        <div class="text-xl md:text-2xl font-bold text-primary">{{ projectsData?.length || 0 }}</div>
        <div class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Total Projects</div>
      </UCard>

      <UCard class="text-center p-4">
        <div class="text-xl md:text-2xl font-bold text-green-600">
          <span class="hidden sm:inline">${{ totalRevenue.toLocaleString() }}</span>
          <span class="sm:hidden">${{ (totalRevenue / 1000).toFixed(0) }}k</span>
        </div>
        <div class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Expected Revenue</div>
      </UCard>

      <UCard class="text-center p-4">
        <div class="text-xl md:text-2xl font-bold text-blue-600">
          <span class="hidden sm:inline">${{ totalCost.toLocaleString() }}</span>
          <span class="sm:hidden">${{ (totalCost / 1000).toFixed(0) }}k</span>
        </div>
        <div class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Total Cost</div>
      </UCard>

      <UCard class="text-center p-4 col-span-2 lg:col-span-1">
        <div class="text-xl md:text-2xl font-bold" :class="averageMarginClass">
          {{ averageMargin.toFixed(1) }}%
        </div>
        <div class="text-gray-600 dark:text-gray-400 text-xs md:text-sm">Average Margin</div>
      </UCard>
    </div>

    <!-- Sort info -->
    <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
      <UIcon name="i-heroicons-bars-arrow-down" class="w-4 h-4 inline mr-1" />
      Sorted by: {{ sortOptions.find(opt => opt.value === sortBy)?.label || 'Name' }}
      <span class="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">(Current value: {{ sortBy }})</span>
    </div>

    <!-- Projects List -->
    <div v-if="pending" class="text-center py-8">
      <div class="text-gray-500 dark:text-gray-400">Loading projects...</div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Error loading projects"
        :description="error.message"
      />
    </div>

    <div v-else-if="!sortedProjects?.length" class="text-center py-12">
      <div class="text-gray-500 dark:text-gray-400 mb-4">
        <UIcon name="i-heroicons-folder-open" class="w-16 h-16 mx-auto mb-4 opacity-50" />
        <div class="text-xl font-medium mb-2">No projects</div>
        <div class="text-sm">Create your first project to get started</div>
      </div>
      <UButton
        icon="i-heroicons-plus"
        @click="navigateTo('/projects/new')"
        color="primary"
        size="lg"
      >
        Create First Project
      </UButton>
    </div>

    <div v-else>
      
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <!-- Project Cards -->
        <div
          v-for="project in sortedProjects"
          :key="project.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          @click="navigateTo(`/projects/${project.id}`)"
        >
          <!-- Header -->
          <div class="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {{ project.name }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                  Client: {{ project.client }}
                </p>
              </div>
              <div class="shrink-0 flex flex-col items-end gap-1">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Active
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {{ project.jobsCount }} job{{ project.jobsCount !== 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="px-4 md:px-6 py-3 md:py-4 space-y-3">
            <!-- Dates -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
              <div>
                <div class="text-gray-500 dark:text-gray-400 mb-1">Start</div>
                <div class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ formatDisplayDate(project.startDate) }}</div>
              </div>
              <div>
                <div class="text-gray-500 dark:text-gray-400 mb-1">Estimated</div>
                <div class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">{{ formatDisplayDate(project.estimatedEndDate) }}</div>
              </div>
            </div>

            <!-- Financial metrics -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                <span class="font-semibold text-green-600 dark:text-green-400 text-sm">
                  <span class="hidden sm:inline">${{ (project.expectedRevenue || 0).toLocaleString() }}</span>
                  <span class="sm:hidden">${{ ((project.expectedRevenue || 0) / 1000).toFixed(0) }}k</span>
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cost:</span>
                <span class="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                  <span class="hidden sm:inline">${{ (project.totalCost || 0).toLocaleString() }}</span>
                  <span class="sm:hidden">${{ ((project.totalCost || 0) / 1000).toFixed(0) }}k</span>
                </span>
              </div>

              <div class="pt-2 border-t border-gray-100 dark:border-gray-700">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Margin:</span>
                  <span class="font-bold text-base sm:text-lg" :class="getMarginClass(project.netMargin)">
                    {{ (project.netMargin || 0).toFixed(1) }}%
                  </span>
                </div>
                <!-- Margin progress bar -->
                <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2">
                  <div 
                    class="h-1.5 sm:h-2 rounded-full transition-all duration-300"
                    :class="getMarginBarClass(project.netMargin)"
                    :style="{ width: `${Math.min(Math.max((project.netMargin || 0), 0), 100)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-4 md:px-6 py-2 md:py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div class="flex justify-between items-center">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                ID: #{{ project.id }}
              </div>
              <div class="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
                <span>View details</span>
                <UIcon name="i-heroicons-chevron-right" class="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta
definePageMeta({
  title: 'Dashboard - Brick Job Costing'
})

// Imports
import { useQuery } from '@vue/apollo-composable'
import { watch } from 'vue'

// GraphQL
const ALL_PROJECT_SUMMARIES_QUERY = gql`
  query AllProjectSummaries {
    allProjectSummaries {
      project {
        id
        name
        client
        startDate
        estimatedEndDate
      }
      jobs {
        id
        title
        price
        estimatedComplexity
        assignedEmployee {
          id
          name
        }
      }
      totalCost
      expectedRevenue
      netMargin
    }
  }
`

// State
const sortBy = ref('name')

// Debug watcher
watch(sortBy, (newVal, oldVal) => {
  console.log(`[Dashboard] Sort changed from ${oldVal} to ${newVal}`)
}, { immediate: true })

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Client (A-Z)', value: 'client' },
  { label: 'Start date (most recent)', value: 'startDate' },
  { label: 'Total cost (highest to lowest)', value: 'totalCost' },
  { label: 'Expected revenue (highest to lowest)', value: 'expectedRevenue' },
  { label: 'Net margin (highest to lowest)', value: 'netMargin' },
  { label: 'Number of jobs (most to least)', value: 'jobsCount' }
]

// Data fetching
const { result, loading: pending, error } = useQuery(ALL_PROJECT_SUMMARIES_QUERY, null, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
})

const projectSummaries = computed(() => {
  return result.value?.allProjectSummaries || []
})

// Transform summaries to project format for compatibility
const projectsData = computed(() => {
  return projectSummaries.value.map(summary => ({
    id: summary.project.id,
    name: summary.project.name,
    client: summary.project.client,
    startDate: summary.project.startDate,
    estimatedEndDate: summary.project.estimatedEndDate,
    totalCost: summary.totalCost,
    expectedRevenue: summary.expectedRevenue,
    netMargin: summary.netMargin,
    jobsCount: summary.jobs.length
  }))
})

// Computed properties for stats
const totalRevenue = computed(() => {
  return projectsData.value.reduce((sum, project) => sum + (project.expectedRevenue || 0), 0)
})

const totalCost = computed(() => {
  return projectsData.value.reduce((sum, project) => sum + (project.totalCost || 0), 0)
})

const averageMargin = computed(() => {
  if (!projectsData.value.length) return 0
  const totalMargin = projectsData.value.reduce((sum, project) => sum + (project.netMargin || 0), 0)
  return totalMargin / projectsData.value.length
})

const averageMarginClass = computed(() => {
  const margin = averageMargin.value
  if (margin >= 25) return 'text-green-600'
  if (margin >= 15) return 'text-yellow-600'
  return 'text-red-600'
})

// Sorted projects
const sortedProjects = computed(() => {
  if (!projectsData.value) return []
  
  const projects = [...projectsData.value]
  const sortField = sortBy.value
  
  return projects.sort((a, b) => {
    let valueA = a[sortField]
    let valueB = b[sortField]
    
    // Handle dates
    if (sortField === 'startDate' || sortField === 'estimatedEndDate') {
      const dateA = valueA ? new Date(valueA).getTime() : 0
      const dateB = valueB ? new Date(valueB).getTime() : 0
      return dateB - dateA // Most recent first
    }

    // Handle strings (name, client)
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return valueA.localeCompare(valueB)
    }

    // Handle numbers (costs, margins, job counts)
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return valueB - valueA // Highest to lowest
    }
    
    // Handle null/undefined values
    if (valueA == null && valueB == null) return 0
    if (valueA == null) return 1
    if (valueB == null) return -1
    
    return 0
  })
})

// Helper functions for inline component
const formatDisplayDate = (dateString: string) => {
  if (!dateString) return 'Not defined'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}

const getMarginClass = (margin: number) => {
  if (!margin) return 'text-gray-500 dark:text-gray-400'
  if (margin >= 25) return 'text-green-600 dark:text-green-400'
  if (margin >= 15) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

const getMarginBarClass = (margin: number) => {
  if (!margin) return 'bg-gray-400'
  if (margin >= 25) return 'bg-green-500'
  if (margin >= 15) return 'bg-yellow-500'
  return 'bg-red-500'
}
</script>
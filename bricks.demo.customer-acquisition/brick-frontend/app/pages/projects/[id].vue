<script setup lang="ts">
import ProjectHeader from '~/components/projects/ProjectHeader.vue';
import CostBreakdownCard from '~/components/projects/CostBreakdownCard.vue';
import JobForm from '~/components/jobs/JobForm.vue';
import AddJobForm from '~/components/jobs/AddJobForm.vue';
import QuoteSummary from '~/components/projects/QuoteSummary.vue';
import EditProjectForm from '~/components/projects/EditProjectForm.vue';
import { useProject } from '~/composables/graphql/useProject';
const route = useRoute();
const id = computed(() => Number(route.params.id));
const { project, loading, error, refetch } = useProject(id.value);
watch(id, () => refetch());
// Estado del slideover renombrado para evitar posibles colisiones y asegurar inicio cerrado.
const isSlideoverOpen = ref(false);
const activeJobId = ref<number | undefined>();
const activeJob = computed(() => project.value?.jobs.find((j) => j.id === activeJobId.value));
// Estado para el modal de agregar trabajo
const showAddJobModal = ref(false);
// Estado para el modal de quote summary
const showQuoteSummary = ref(false);
// Estado para el modal de editar proyecto
const showEditProjectModal = ref(false);
function edit(job: any) {
  activeJobId.value = job.id;
  isSlideoverOpen.value = true;
}
function closeSlideover() {
  isSlideoverOpen.value = false;
}
function onSaved() {
  isSlideoverOpen.value = false;
  refetch();
}

function onJobCreated() {
  showAddJobModal.value = false;
  refetch();
}

function onEditProject() {
  showEditProjectModal.value = true;
}

function onProjectSaved() {
  showEditProjectModal.value = false;
  refetch();
}

onMounted(() => {
  // Fuerza cerrado al montar (evita que HMR o estado previo lo abra solo).
  isSlideoverOpen.value = false;
});
</script>

<template>
  <div class="p-3 md:p-4 space-y-4">
    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <NuxtLink to="/projects">
        <UButton variant="ghost" icon="i-heroicons-arrow-left" size="sm">
          <span class="hidden sm:inline">Back</span>
        </UButton>
      </NuxtLink>
    </div>

    <!-- Project Header -->
    <ProjectHeader :project="project" :show-edit-button="true" @edit="onEditProject" />
    
    <!-- Layout Grid -->
    <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">
      <!-- Cost Breakdown - Full width on mobile, sidebar on desktop -->
      <div class="lg:order-1">
        <CostBreakdownCard :project="project" />
      </div>
      
      <!-- Jobs Section - Full width on mobile, main content on desktop -->
      <UCard class="lg:col-span-2 lg:order-2">
        <!-- Jobs Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <h2 class="text-lg font-semibold">Jobs</h2>
          <div class="flex flex-col sm:flex-row gap-2">
            <UButton 
              variant="outline" 
              icon="i-heroicons-document-text"
              size="sm"
              :disabled="!project?.jobs || project.jobs.length === 0"
              @click="showQuoteSummary = true"
              class="w-full sm:w-auto text-xs sm:text-sm"
            >
              <span class="hidden sm:inline">View Quote Summary</span>
              <span class="sm:hidden">Summary</span>
            </UButton>
            <UButton 
              color="primary" 
              icon="i-heroicons-plus"
              size="sm"
              @click="showAddJobModal = true"
              class="w-full sm:w-auto"
            >
              Add Job
            </UButton>
          </div>
        </div>
        <!-- Loading/Error States -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div class="text-gray-600 dark:text-gray-400">Loading jobs...</div>
        </div>
        <div v-else-if="error" class="text-red-600 bg-red-50 p-4 rounded-lg">
          <div class="font-semibold">Error loading jobs</div>
          <div class="text-sm mt-1">{{ error.message }}</div>
        </div>

        <!-- Jobs List -->
        <div v-else>
          <!-- Desktop Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left border-b border-gray-200 dark:border-gray-700">
                  <th class="pb-2 font-medium text-gray-900 dark:text-gray-100">Title</th>
                  <th class="pb-2 font-medium text-gray-900 dark:text-gray-100">Complexity</th>
                  <th class="pb-2 font-medium text-gray-900 dark:text-gray-100">Price</th>
                  <th class="pb-2 font-medium text-gray-900 dark:text-gray-100">Employee</th>
                  <th class="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="j in project?.jobs" :key="j.id" class="border-b border-gray-100 dark:border-gray-700">
                  <td class="py-3">{{ j.title }}</td>
                  <td class="py-3">{{ j.estimatedComplexity }}</td>
                  <td class="py-3">${{ j.price?.toLocaleString() || '0' }}</td>
                  <td class="py-3">{{ j.assignedEmployee?.name || '—' }}</td>
                  <td class="py-3">
                    <UButton size="xs" variant="outline" @click="edit(j)">Edit</UButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="md:hidden space-y-3">
            <div v-for="j in project?.jobs" :key="j.id" 
                 class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-medium text-gray-900 dark:text-gray-100 flex-1 mr-2">{{ j.title }}</h4>
                <UButton size="xs" variant="outline" @click="edit(j)" class="shrink-0">
                  Edit
                </UButton>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Complexity:</span>
                  <span class="ml-1 font-medium">{{ j.estimatedComplexity }}</span>
                </div>
                <div>
                  <span class="text-gray-500 dark:text-gray-400">Price:</span>
                  <span class="ml-1 font-medium text-green-600">${{ j.price?.toLocaleString() || '0' }}</span>
                </div>
              </div>
              <div class="mt-2 text-sm">
                <span class="text-gray-500 dark:text-gray-400">Employee:</span>
                <span class="ml-1">{{ j.assignedEmployee?.name || 'Unassigned' }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!project?.jobs || project.jobs.length === 0"
                 class="text-center py-8 text-gray-500 dark:text-gray-400">
              <div class="text-4xl mb-2">📋</div>
              <div class="font-medium mb-1">No jobs</div>
              <div class="text-sm">Add the first job to this project</div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <!-- <USlideover v-model="isSlideoverOpen"> -->
    <UCard v-if="isSlideoverOpen">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Edit Job</h3>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="closeSlideover" />
        </div>
      </template>
      <JobForm :job-id="activeJobId" :job="activeJob" :project-id="id" @saved="onSaved" />
    </UCard>
    <!-- </USlideover> -->

    <!-- Modal para agregar trabajo -->
    <!-- <UModal v-model="showAddJobModal"> -->
      <UCard v-if="showAddJobModal" class="mb-4">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="font-semibold">Add Job</h3>
            <UButton icon="i-heroicons-x-mark" variant="ghost" @click="showAddJobModal = false" />
          </div>
        </template>
        <AddJobForm
          :project-id="id"
          @job-created="onJobCreated"
          @close="showAddJobModal = false"
        />
      </UCard>
    <!-- </UModal> -->

    <!-- Modal para Quote Summary -->
    <UCard v-if="showQuoteSummary" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Quote Summary</h3>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="showQuoteSummary = false" />
        </div>
      </template>
      <QuoteSummary
        :project="project"
        @close="showQuoteSummary = false"
      />
    </UCard>

    <!-- Modal para Editar Proyecto -->
    <UCard v-if="showEditProjectModal" class="mb-4">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold">Edit Project</h3>
          <UButton icon="i-heroicons-x-mark" variant="ghost" @click="showEditProjectModal = false" />
        </div>
      </template>
      <EditProjectForm
        :project="project"
        :project-id="id"
        @saved="onProjectSaved"
        @close="showEditProjectModal = false"
      />
    </UCard>
  </div>
</template>

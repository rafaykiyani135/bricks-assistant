<template>
  <UCard class="w-full">
    <template #header>
      <h2 class="text-xl font-semibold">New Project Quote</h2>
      <p class="text-sm text-gray-600">Create a new project quote</p>
    </template>

    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Field: Project Name -->
      <div>
        <label for="project-name" class="block text-sm font-medium mb-1"> Project Name * </label>
        <UInput
          id="project-name"
          v-model="form.name"
          placeholder="Ex: Kitchen renovation"
          :color="errors.name ? 'error' : undefined"
          @blur="validateSingleField('name')"
          required
        />
        <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
      </div>

      <!-- Field: Client -->
      <div>
        <label for="project-client" class="block text-sm font-medium mb-1"> Client * </label>
        <UInput
          id="project-client"
          v-model="form.client"
          placeholder="Ex: John Doe"
          :color="errors.client ? 'error' : undefined"
          @blur="validateSingleField('client')"
          required
        />
        <p v-if="errors.client" class="text-xs text-red-600 mt-1">{{ errors.client }}</p>
      </div>

      <!-- Field: Estimated Start Date -->
      <div>
        <label for="project-start-date" class="block text-sm font-medium mb-1">
          Estimated Start Date *
        </label>
        <UInput
          id="project-start-date"
          type="date"
          v-model="form.startDate"
          :color="errors.startDate ? 'error' : undefined"
          @blur="validateSingleField('startDate')"
          @change="validateSingleField('startDate')"
          required
        />
        <p v-if="errors.startDate" class="text-xs text-red-600 mt-1">{{ errors.startDate }}</p>
      </div>

      <!-- Field: Estimated End Date -->
      <div>
        <label for="project-end-date" class="block text-sm font-medium mb-1">
          Estimated End Date *
        </label>
        <UInput
          id="project-end-date"
          type="date"
          v-model="form.estimatedEndDate"
          :color="errors.estimatedEndDate ? 'error' : undefined"
          @blur="validateSingleField('estimatedEndDate')"
          @change="validateSingleField('estimatedEndDate')"
          required
        />
        <p v-if="errors.estimatedEndDate" class="text-xs text-red-600 mt-1">
          {{ errors.estimatedEndDate }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 pt-4">
        <UButton type="button" variant="ghost" @click="resetForm" :disabled="loading">
          Clear
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="!isFormValid"
          size="md"
          class="max-w-xs p-4"
        >
          Create Project Quote
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCreateProject, type CreateProjectInput } from '~/composables/graphql/useCreateProject';
import { navigateTo } from '#app';

// Form state
const form = ref<CreateProjectInput>({
  name: '',
  client: '',
  startDate: '',
  estimatedEndDate: '',
});

// Validation errors
const errors = ref<Partial<Record<keyof CreateProjectInput, string>>>({});

// Track which fields have been touched
const touched = ref<Partial<Record<keyof CreateProjectInput, boolean>>>({});

// Validation rules
const validateField = (field: keyof CreateProjectInput, value: string): string => {
  switch (field) {
    case 'name':
      if (!value || !value.trim()) return 'Project name is required';
      if (value.trim().length < 3) return 'Name must be at least 3 characters';
      if (value.trim().length > 100) return 'Name cannot exceed 100 characters';
      return '';

    case 'client':
      if (!value || !value.trim()) return 'Client is required';
      if (value.trim().length < 2) return 'Client name must be at least 2 characters';
      if (value.trim().length > 100) return 'Client name cannot exceed 100 characters';
      return '';

    case 'startDate':
      if (!value) return 'Start date is required';
      const today: string = new Date().toISOString().split('T')[0] ?? '';
      if (value < today) return 'Start date cannot be in the past';
      return '';

    case 'estimatedEndDate':
      if (!value) return 'End date is required';
      if (form.value.startDate && value <= form.value.startDate) {
        return 'End date must be after start date';
      }
      return '';

    default:
      return '';
  }
};

// Validate all fields
const validateForm = () => {
  const newErrors: Partial<Record<keyof CreateProjectInput, string>> = {};

  (Object.keys(form.value) as Array<keyof CreateProjectInput>).forEach((field) => {
    if (touched.value[field]) {
      // Solo validar campos que han sido tocados
      const error = validateField(field, form.value[field]);
      if (error) newErrors[field] = error;
    }
  });

  errors.value = newErrors;
};

// Validate a single field when touched
const validateSingleField = (field: keyof CreateProjectInput) => {
  touched.value[field] = true;
  const error = validateField(field, form.value[field]);
  if (error) {
    errors.value[field] = error;
  } else {
    delete errors.value[field];
  }
};

// Computed form validity
const isFormValid = computed(() => {
  const hasNoErrors = Object.keys(errors.value).length === 0;
  const hasRequiredFields =
    form.value.name.trim().length > 0 &&
    form.value.client.trim().length > 0 &&
    form.value.startDate.length > 0 &&
    form.value.estimatedEndDate.length > 0;

  return hasNoErrors && hasRequiredFields;
});

// No auto-validation on form changes - only validate touched fields

// Emit events
const emit = defineEmits<{
  'project-created': [project: any];
}>();

// Create project composable
const { createProject, loading, error, onDone } = useCreateProject();
const toast = useToast();

// Handle successful project creation
onDone((result) => {
  if (result?.data?.createProject) {
    const newProject = result.data.createProject;
    navigateTo(`/projects/${newProject.id}`);

    toast.add({
      title: 'Project created!',
      description: `The project "${newProject.name}" has been created successfully`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });
  } else {
    toast.add({
      title: 'Error creating project',
      description: 'An unexpected error occurred',
      color: 'error',
      icon: 'i-heroicons-x-circle',
    });
  }
});

// Watch for errors
watch(error, (err) => {
  if (err) {
    toast.add({
      title: 'Error creating project',
      description: err.message || 'An unexpected error occurred',
      color: 'error',
      icon: 'i-heroicons-x-circle',
    });
  }
});

// Form submission
const onSubmit = async () => {
  // Mark all fields as touched and validate
  (Object.keys(form.value) as Array<keyof CreateProjectInput>).forEach((field) => {
    touched.value[field] = true;
  });

  // Validate all fields
  const newErrors: Partial<Record<keyof CreateProjectInput, string>> = {};
  (Object.keys(form.value) as Array<keyof CreateProjectInput>).forEach((field) => {
    const error = validateField(field, form.value[field]);
    if (error) newErrors[field] = error;
  });
  errors.value = newErrors;

  if (!isFormValid.value) {
    toast.add({
      title: 'Incomplete form',
      description: 'Please correct the errors before continuing',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle',
    });
    return;
  }

  // Prepare clean data
  const projectData: CreateProjectInput = {
    name: form.value.name.trim(),
    client: form.value.client.trim(),
    startDate: form.value.startDate,
    estimatedEndDate: form.value.estimatedEndDate,
  };

  // Extra validation before sending
  if (!projectData.name || !projectData.client) {
    toast.add({
      title: 'Validation error',
      description: 'Missing required fields',
      color: 'error',
    });
    return;
  }

  try {
    await createProject(projectData);
  } catch (error) {
    console.error('createProject failed:', error);
  }
};

// Reset form
const resetForm = () => {
  form.value = {
    name: '',
    client: '',
    startDate: '',
    estimatedEndDate: '',
  };
  errors.value = {};
  touched.value = {};

  // Set default start date to today
  const today: string = new Date().toISOString().split('T')[0] ?? '';
  form.value.startDate = today;
};

// Set default start date to today
const today: string = new Date().toISOString().split('T')[0] ?? '';
form.value.startDate = today;
</script>

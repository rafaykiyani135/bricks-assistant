<template>
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
      <UButton type="button" variant="ghost" @click="$emit('close')" :disabled="loading">
        Cancel
      </UButton>
      <UButton
        type="submit"
        color="primary"
        :loading="loading"
        :disabled="!isFormValid"
      >
        Save
      </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useUpdateProject, type UpdateProjectInput } from '~/composables/graphql/useUpdateProject';
import type { ProjectEntity } from '~/graphql/types';

// Props
const props = defineProps<{
  project?: ProjectEntity;
  projectId: number;
}>();

// Emits
const emit = defineEmits<{
  saved: [];
  close: [];
}>();

// Form state
const form = ref<UpdateProjectInput>({
  name: '',
  client: '',
  startDate: '',
  estimatedEndDate: '',
});

// Initialize form with project data
onMounted(() => {
  if (props.project) {
    form.value = {
      name: props.project.name || '',
      client: props.project.client || '',
      startDate: props.project.startDate ? new Date(props.project.startDate).toISOString().split('T')[0] : '',
      estimatedEndDate: props.project.estimatedEndDate ? new Date(props.project.estimatedEndDate).toISOString().split('T')[0] : '',
    };
  }
});

// Validation errors
const errors = ref<Partial<Record<keyof UpdateProjectInput, string>>>({});

// Track which fields have been touched
const touched = ref<Partial<Record<keyof UpdateProjectInput, boolean>>>({});

// Validation rules
const validateField = (field: keyof UpdateProjectInput, value: string | undefined): string => {
  if (!value) return '';

  switch (field) {
    case 'name':
      if (!value.trim()) return 'Project name is required';
      if (value.trim().length < 3) return 'Name must be at least 3 characters';
      if (value.trim().length > 100) return 'Name cannot exceed 100 characters';
      return '';

    case 'client':
      if (!value.trim()) return 'Client is required';
      if (value.trim().length < 2) return 'Client name must be at least 2 characters';
      if (value.trim().length > 100) return 'Client name cannot exceed 100 characters';
      return '';

    case 'startDate':
      if (!value) return 'Start date is required';
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

// Validate a single field when touched
const validateSingleField = (field: keyof UpdateProjectInput) => {
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
    (form.value.name?.trim().length || 0) > 0 &&
    (form.value.client?.trim().length || 0) > 0 &&
    (form.value.startDate?.length || 0) > 0 &&
    (form.value.estimatedEndDate?.length || 0) > 0;

  return hasNoErrors && hasRequiredFields;
});

// Update project composable
const { updateProject, loading, error, onDone } = useUpdateProject();
const toast = useToast();

// Handle successful project update
onDone((result) => {
  if (result?.data?.updateProject) {
    const updatedProject = result.data.updateProject;
    toast.add({
      title: 'Success!',
      description: `Project "${updatedProject.name}" has been updated successfully`,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    });

    emit('saved');
  }
});

// Watch for errors
watch(error, (err) => {
  if (err) {
    toast.add({
      title: 'Error updating project',
      description: err.message || 'An unexpected error occurred',
      color: 'error',
      icon: 'i-heroicons-x-circle',
    });
  }
});

// Form submission
const onSubmit = async () => {
  // Mark all fields as touched and validate
  (Object.keys(form.value) as Array<keyof UpdateProjectInput>).forEach((field) => {
    touched.value[field] = true;
  });

  // Validate all fields
  const newErrors: Partial<Record<keyof UpdateProjectInput, string>> = {};
  (Object.keys(form.value) as Array<keyof UpdateProjectInput>).forEach((field) => {
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
  const projectData: UpdateProjectInput = {
    name: form.value.name?.trim(),
    client: form.value.client?.trim(),
    startDate: form.value.startDate,
    estimatedEndDate: form.value.estimatedEndDate,
  };

  try {
    await updateProject(props.projectId, projectData);
  } catch (error) {
    console.error('updateProject failed:', error);
  }
};
</script>

<template>
  <UCard class="w-full max-w-2xl mx-auto">
    <template #header>
      <div class="flex justify-between items-center">
        <h3 class="text-base sm:text-lg font-semibold">Add New Job</h3>
        <UButton 
          icon="i-heroicons-x-mark" 
          variant="ghost" 
          size="sm"
          @click="$emit('close')"
          class="sm:hidden"
        />
      </div>
    </template>

    <form @submit.prevent="onSubmit" class="space-y-4 p-1">
      <!-- Título -->
      <div>
        <label for="job-title" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Job Title *
        </label>
        <UInput
          id="job-title"
          v-model="form.title"
          placeholder="Ex: Kitchen electrical installation"
          :color="errors.title ? 'error' : undefined"
          @blur="validateSingleField('title')"
          @input="validateSingleField('title')"
          size="lg"
          class="w-full"
          required
        />
        <p v-if="errors.title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
      </div>

      <!-- Categoría -->
      <div>
        <label for="job-category" class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Category *
        </label>
        <select
          id="job-category"
          v-model="form.category"
          class="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          :class="{ 'border-red-500': errors.category }"
          @change="validateSingleField('category')"
          required
        >
          <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Select a category</option>
          <option value="ELECTRICAL" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">⚡ Electrical</option>
          <option value="PLUMBING" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">🚿 Plumbing</option>
          <option value="CARPENTRY" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">🔨 Carpentry</option>
          <option value="PAINTING" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">🎨 Painting</option>
          <option value="OTHER" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">📦 Other</option>
        </select>
        <p v-if="errors.category" class="text-xs text-red-600 mt-1">{{ errors.category }}</p>
      </div>

      <!-- Complejidad -->
      <div>
        <label for="job-complexity" class="block text-sm font-medium mb-1">
          Estimated Complexity (hours) *
        </label>
        <UInput
          id="job-complexity"
          type="number"
          v-model.number="form.estimatedComplexity"
          placeholder="8"
          min="0.5"
          step="0.5"
          :color="errors.estimatedComplexity ? 'error' : undefined"
          @blur="validateSingleField('estimatedComplexity')"
          @input="validateSingleField('estimatedComplexity')"
          required
        />
        <p v-if="errors.estimatedComplexity" class="text-xs text-red-600 mt-1">{{ errors.estimatedComplexity }}</p>
      </div>

      <!-- Precio -->
      <div>
        <label for="job-price" class="block text-sm font-medium mb-1">
          Price (USD) *
        </label>
        <UInput
          id="job-price"
          type="number"
          v-model.number="form.price"
          placeholder="150.00"
          min="0"
          step="0.01"
          :color="errors.price ? 'error' : undefined"
          @blur="validateSingleField('price')"
          @input="validateSingleField('price')"
          required
        />
        <p v-if="errors.price" class="text-xs text-red-600 mt-1">{{ errors.price }}</p>
      </div>

      <!-- Empleado Asignado -->
      <div>
        <label for="job-employee" class="block text-sm font-medium mb-1">
          Assigned Employee (Optional)
        </label>
        <select
          id="job-employee"
          v-model.number="form.assignedEmployeeId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          :class="{ 'border-red-500': errors.assignedEmployeeId }"
          @change="validateSingleField('assignedEmployeeId')"
        >
          <option value="" class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">Unassigned</option>
          <option
            v-for="employee in availableEmployees"
            :key="employee.id"
            :value="employee.id"
            :disabled="employee.available === false"
            class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {{ employee.name }}{{ employee.available === false ? ' (Assigned to another job)' : '' }}
          </option>
        </select>
        <p v-if="errors.assignedEmployeeId" class="text-xs text-red-600 mt-1">{{ errors.assignedEmployeeId }}</p>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-3 pt-4 border-t">
        <UButton 
          type="button" 
          variant="ghost" 
          @click="resetForm"
          :disabled="loading"
        >
          Clear
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="loading"
          :disabled="!isFormValid"
          size="sm"
          class="flex-1"
        >
          Add Job
        </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCreateJob, type CreateJobInput } from '~/composables/graphql/useCreateJob';
import { useEmployees } from '~/composables/graphql/useEmployees';
import { useProject } from '~/composables/graphql/useProject';
import { useEmployeeAvailability } from '~/composables/useEmployeeAvailability';

// Props
const props = defineProps<{
  projectId: number;
}>();

// Emits
const emit = defineEmits<{
  jobCreated: [job: any];
  close: [];
}>();

// Composables
const { createJob, loading } = useCreateJob();
const { employees } = useEmployees();
const { project } = useProject(props.projectId);
const toast = useToast();

// Calculate employee availability based on current project jobs
const currentJobs = computed(() => project.value?.jobs || []);
const { employeesWithAvailability } = useEmployeeAvailability(
  employees,
  currentJobs
);
console.log('AddJobForm - employees with availability:', employeesWithAvailability.value);

// Use employees with calculated availability
// Ensure assigned employee is always present in the dropdown, even if unavailable
const availableEmployees = computed(() => {
  const assignedId = form.value.assignedEmployeeId;
  const allEmployees = employeesWithAvailability.value;
  if (!assignedId) return allEmployees;
  const alreadyIncluded = allEmployees.some(e => e.id === assignedId);
  if (alreadyIncluded) return allEmployees;
  // Find the assigned employee in the full employees list
  const assignedEmployee = employees.value.find(e => e.id === assignedId);
  if (assignedEmployee) {
    return [...allEmployees, { ...assignedEmployee, available: false }];
  }
  return allEmployees;
});

// Form state
const form = ref<CreateJobInput>({
  title: '',
  category: '',
  estimatedComplexity: 0,
  price: 0,
  assignedEmployeeId: undefined,
  projectId: props.projectId
});

// Validation errors
const errors = ref<Partial<Record<keyof CreateJobInput, string>>>({});

// Track which fields have been touched
const touched = ref<Partial<Record<keyof CreateJobInput, boolean>>>({});

// Validation rules
const validateField = (field: keyof CreateJobInput, value: any): string => {
  switch (field) {
    case 'title':
      if (!value || !value.trim()) return 'Title is required';
      if (value.trim().length < 3) return 'Title must be at least 3 characters';
      if (value.trim().length > 100) return 'Title cannot exceed 100 characters';
      return '';

    case 'category':
      if (!value) return 'Category is required';
      const validCategories = ['ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'PAINTING', 'OTHER'];
      if (!validCategories.includes(value)) return 'Invalid category';
      return '';

    case 'estimatedComplexity':
      if (typeof value !== 'number' || value <= 0) return 'Complexity must be a positive number';
      if (value > 1000) return 'Complexity cannot exceed 1000 hours';
      return '';

    case 'price':
      if (typeof value !== 'number' || value <= 0) return 'Price must be a positive number';
      if (value > 100000) return 'Price cannot exceed $100,000';
      return '';

    case 'assignedEmployeeId':
      // Employee is optional
      if (value) {
        // Check in availableEmployees first
        const employee = availableEmployees.value.find(e => e.id.toString() === value.toString());
        if (!employee) {
          return 'Selected employee does not exist';
        }
        if (employee.available === false) {
          return 'Employee is already assigned to another job in this project';
        }
      }
      return '';
    
    default:
      return '';
  }
};

// Validate single field
const validateSingleField = (field: keyof CreateJobInput) => {
  touched.value[field] = true;
  const error = validateField(field, form.value[field]);
  errors.value[field] = error;
};

// Check if form is valid
const isFormValid = computed(() => {
  // Check required fields only (assignedEmployeeId is optional)
  const hasTitle = form.value.title?.trim().length > 0;
  const hasCategory = form.value.category?.trim().length > 0;
  const hasComplexity = typeof form.value.estimatedComplexity === 'number' && form.value.estimatedComplexity > 0;
  const hasPrice = typeof form.value.price === 'number' && form.value.price > 0;

  const requiredFieldsValid = hasTitle && hasCategory && hasComplexity && hasPrice;
  const noErrors = Object.values(errors.value).every(error => !error);

  return requiredFieldsValid && noErrors;
});

// Form submission
const onSubmit = async () => {
  // Mark all fields as touched and validate
  (Object.keys(form.value) as Array<keyof CreateJobInput>).forEach(field => {
    touched.value[field] = true;
  });
  
  // Validate all fields
  const newErrors: Partial<Record<keyof CreateJobInput, string>> = {};
  (Object.keys(form.value) as Array<keyof CreateJobInput>).forEach(field => {
    const error = validateField(field, form.value[field]);
    if (error) newErrors[field] = error;
  });
  errors.value = newErrors;
  
  if (!isFormValid.value) {
    toast.add({
      title: 'Incomplete form',
      description: 'Please correct the errors before continuing',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle'
    });
    return;
  }

  try {
    const result = await createJob(form.value);

    toast.add({
      title: 'Job added',
      description: 'The job has been added to the project successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });

    emit('jobCreated', result);
    resetForm();
    emit('close');
  } catch (error) {
    console.error('createJob failed:', error);
    toast.add({
      title: 'Error adding job',
      description: 'There was a problem adding the job. Please try again.',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    });
  }
};

// Reset form
const resetForm = () => {
  form.value = {
    title: '',
    category: '',
    estimatedComplexity: 0,
    price: 0,
    assignedEmployeeId: undefined,
    projectId: props.projectId
  };
  errors.value = {};
  touched.value = {};
};
</script>
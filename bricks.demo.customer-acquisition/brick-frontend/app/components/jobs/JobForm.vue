<template>
  <UCard class="space-y-4" :ui="{body:'space-y-4'}">
    <form @submit.prevent="onSubmit" novalidate>
      <div class="space-y-3">
        <!-- Campo: Título -->
        <div>
          <label for="job-title" class="block text-sm font-medium mb-1">Title</label>
          <UInput id="job-title" v-model="form.title" placeholder="Job title" aria-describedby="err-title" />
          <p v-if="errors.title" id="err-title" class="text-xs text-red-600 mt-1">{{ errors.title }}</p>
        </div>
        <!-- Campo: Complejidad -->
        <div>
          <label for="job-complexity" class="block text-sm font-medium mb-1">Complexity</label>
          <UInput id="job-complexity" type="number" v-model.number="form.estimatedComplexity" min="0" max="100" aria-describedby="err-complexity" />
          <p v-if="errors.estimatedComplexity" id="err-complexity" class="text-xs text-red-600 mt-1">{{ errors.estimatedComplexity }}</p>
        </div>
        <!-- Campo: Precio -->
        <div>
          <label for="job-price" class="block text-sm font-medium mb-1">Price</label>
          <UInput id="job-price" type="number" v-model.number="form.price" min="0" step="0.01" aria-describedby="err-price" />
          <p v-if="errors.price" id="err-price" class="text-xs text-red-600 mt-1">{{ errors.price }}</p>
        </div>
        <!-- Campo: Empleado -->
        <div>
          <label for="job-employee" class="block typography-caption font-medium mb-1 text-brick-offwhite/90">
            Assign Employee
            <span v-if="loadingEmployees" class="ml-2 inline-block">
              <svg class="animate-spin h-4 w-4 text-brick-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </label>
          
          <!-- Mostrar empleado actual si existe -->
<!--           <div v-if="originalEmployeeId && originalEmployeeId !== form.assignedEmployeeId" class="mb-2 p-2 bg-brick-yellow/20 border border-brick-yellow/40 rounded-md">
            <p class="typography-caption text-brick-yellow font-medium">
              ⚠️ Job actualmente asignado a: {{ getEmployeeName(originalEmployeeId) }}
            </p>
            <p class="typography-caption text-brick-offwhite/70 mt-1">
              Al guardar se reasignará al empleado seleccionado.
            </p>
          </div> -->
          <div class="relative max-w-xs">
            <select
              id="job-employee"
              v-model="form.assignedEmployeeId"
              :disabled="loadingEmployees"
              class="block w-full rounded-md border-0 px-3 py-1.5 typography-body text-white shadow-sm ring-1 ring-inset ring-brick-orange/40 bg-stone-800 focus:ring-2 focus:ring-inset focus:ring-brick-orange disabled:cursor-not-allowed disabled:bg-stone-700/50 disabled:text-white/40 disabled:ring-brick-orange/20 sm:leading-6 appearance-none pr-8"
              style="color-scheme: dark;"
              aria-describedby="err-employee"
              @change="onEmployeeChange"
            >
              <option value="" disabled style="background-color: #1c1917; color: #a8a29e;">
                {{ loadingEmployees ? 'Loading employees...' : 'Select employee' }}
              </option>
              <option
                v-for="emp in employeeOptions"
                :key="emp.value"
                :value="emp.value"
                :disabled="emp.available === false"
                style="background-color: #1c1917; color: #ffffff;"
              >
                {{ emp.label }}{{ emp.available === false ? ' (Assigned to another job)' : '' }}
              </option>
            </select>
            <!-- Ícono de flecha -->
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg class="h-4 w-4 text-brick-orange/60" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Mostrar detalles del empleado seleccionado -->
          <div v-if="selectedEmployeeDetails" class="mt-2 p-3 bg-brick-dark/40 border border-brick-orange/30 rounded-md max-w-xs">
            <div class="flex items-center justify-between">
              <span class="typography-caption font-medium text-brick-offwhite">{{ selectedEmployeeDetails.name }}</span>
              <span class="typography-caption text-brick-turquoise">${{ selectedEmployeeDetails.hourlyCost }}/h</span>
            </div>
            <p class="typography-caption text-brick-offwhite/70 mt-1">{{ selectedEmployeeDetails.role }}</p>
            <p class="typography-caption text-brick-green mt-1">Productivity: {{ selectedEmployeeDetails.productivity }}%</p>
          </div>
          <p v-if="employeesError" class="typography-caption text-brick-red mt-1">Could not load employees.</p>
          <p v-if="errors.assignedEmployeeId" id="err-employee" class="typography-caption text-brick-red mt-1">{{ errors.assignedEmployeeId }}</p>
        </div>

        <!-- Estimación de costos -->
        <div v-if="selectedEmployeeDetails && form.estimatedComplexity" class="mt-4 p-3 bg-brick-green/10 border border-brick-green/30 rounded-md">
          <h4 class="typography-caption font-medium text-brick-green mb-2">💰 Cost Estimation</h4>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="typography-caption text-brick-offwhite/80">Complexity:</span>
              <span class="typography-caption text-brick-offwhite">{{ form.estimatedComplexity }}h</span>
            </div>
            <div class="flex justify-between">
              <span class="typography-caption text-brick-offwhite/80">Hourly cost:</span>
              <span class="typography-caption text-brick-turquoise">${{ selectedEmployeeDetails.hourlyCost }}</span>
            </div>
            <div class="flex justify-between">
              <span class="typography-caption text-brick-offwhite/80">Productivity:</span>
              <span class="typography-caption text-brick-green">{{ selectedEmployeeDetails.productivity }}%</span>
            </div>
            <hr class="border-brick-green/20">
            <div class="flex justify-between font-medium">
              <span class="typography-caption text-brick-green">Estimated cost:</span>
              <span class="typography-caption text-brick-green">${{ estimatedJobCost }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Confirmation Dialog para reasignación -->
      <div v-if="showConfirmation" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-stone-900 border-2 border-brick-orange/60 rounded-lg p-6 max-w-md mx-4 shadow-2xl">
          <h3 class="typography-subtitle text-brick-orange mb-3">Confirm Reassignment</h3>
          <p class="typography-body text-white mb-4">
            This job is already assigned to <strong class="text-brick-orange">{{ getEmployeeName(originalEmployeeId) }}</strong>.
            Do you want to reassign it to <strong class="text-brick-orange">{{ getEmployeeName(pendingEmployeeId) }}</strong>?
          </p>
          <p class="typography-caption text-brick-yellow mb-4">
            💡 This will automatically recalculate the project costs.
          </p>
          <div class="flex gap-3 justify-end">
            <UButton variant="ghost" @click="cancelReassignment">Cancel</UButton>
            <UButton color="primary" @click="confirmReassignment">Confirm</UButton>
          </div>
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-4">
        <UButton type="button" variant="ghost" @click="reset">Reset</UButton>
        <UButton type="submit" color="primary" :loading="loading" :disabled="submitting || !isValid">
          Save Changes
        </UButton>
      </div>
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { object, number, string } from 'yup';
import { useUpdateJob } from '~/composables/graphql/useUpdateJob';
import { useEmployees } from '~/composables/graphql/useEmployees';
import { useProject } from '~/composables/graphql/useProject';
import { useEmployeeAvailability } from '~/composables/useEmployeeAvailability';
import { computed, watch, ref } from 'vue';

// State for confirmation dialog and original employee tracking
const showConfirmation = ref(false);
const originalEmployeeId = ref<number | null>(null);
const pendingEmployeeId = ref<number | null>(null);

// Simple validation schema
const schema = object({
  title: string().trim().required('Title required').min(3, 'Minimum 3 characters'),
  estimatedComplexity: number().typeError('Must be a number').min(0, 'Cannot be negative').max(100, 'Max 100').required('Complexity required'),
  price: number().typeError('Must be a number').min(0, 'Cannot be negative').required('Price required'),
  assignedEmployeeId: number()
    .typeError('Must be a number')
    .min(1, 'ID >= 1')
    .required('Employee required')
    .test('employee-available', 'Employee is not available', function(value) {
      if (!value) return true;
      // Find employee in employeeOptions which already has availability calculated
      const employee = employeeOptions.value.find(e => e.value.toString() === value.toString());
      if (!employee) return true; // Will be caught by employee-exists test
      // Employee is valid if available, OR if it's not available but there's no original (new job)
      // Since we're using excludeJobId in useEmployeeAvailability, the current job's employee will show as available
      return employee.available !== false;
    }),
});

interface JobFormState {
  title: string;
  estimatedComplexity: number | null;
  price: number | null;
  assignedEmployeeId: number | null;
}

interface EditableJob {
  id: number;
  title: string;
  estimatedComplexity: number;
  price: number;
  assignedEmployee?: { id: number; name: string } | null;
  assignedEmployeeId?: number; // fallback if provided separately
}

const props = defineProps<{ 
  jobId?: number; 
  job?: EditableJob;
  projectId?: number; 
}>();
const emit = defineEmits<{ (e: 'saved'): void }>();

const form = reactive<JobFormState>({
  title: '',
  estimatedComplexity: 1,
  price: 0,
  assignedEmployeeId: null,
});

// Employees data
const { employees, loading: loadingEmployees, error: employeesError } = useEmployees();

// Get project data to calculate employee availability
const { project } = useProject(props.projectId || 0);
const currentJobs = computed(() => project.value?.jobs || []);
const excludeJobId = computed(() => props.jobId);

// Calculate employee availability excluding current job
const { employeesWithAvailability } = useEmployeeAvailability(
  employees,
  currentJobs,
  excludeJobId
);

// Employee options from employees with availability
type EmployeeOption = { value: number; label: string; role: string; hourlyCost: number; available: boolean };
const employeeOptions = computed<EmployeeOption[]>(() =>
  employeesWithAvailability.value.map(e => ({
    value: e.id,
    label: e.name,
    role: (e as any).role,
    hourlyCost: (e as any).hourlyCost,
    available: e.available
  }))
);

const selectedEmployeeDetails = computed(() => {
  if (!form.assignedEmployeeId) return null;
  const emp = employeeOptions.value.find(emp => emp.value.toString() === form?.assignedEmployeeId?.toString());
  if (!emp) return null;
  return {
    ...emp,
    name: emp.label,
    productivity: (employees.value.find(e => e.id === emp.value) as any)?.productivity || 100
  };
});

// Calculated cost estimation
const estimatedJobCost = computed(() => {
  if (!selectedEmployeeDetails.value || !form.estimatedComplexity) return '0.00';
  const baseHours = form.estimatedComplexity;
  const hourlyRate = selectedEmployeeDetails.value.hourlyCost;
  const productivity = selectedEmployeeDetails.value.productivity / 100;
  const adjustedHours = baseHours / productivity; // More hours needed if productivity < 100%
  const totalCost = adjustedHours * hourlyRate;
  return totalCost.toFixed(2);
});

// Helper function to get employee name by ID
const getEmployeeName = (employeeId: number | null) => {
  console.log('getEmployeeName called with:', employeeId, typeof employeeId);
  console.log('getEmployeeName - employeeOptions available:', employeeOptions.value.length);
  console.log('getEmployeeName - searching in:', employeeOptions.value.map(e => ({ id: e.value, type: typeof e.value, name: e.label })));
  
  if (!employeeId) return 'Unassigned';
  // Convert both to numbers for comparison since employeeOptions.value might have string IDs
  const emp = employeeOptions.value.find(e => Number(e.value) === Number(employeeId));

  console.log('getEmployeeName - found employee:', emp);
  return emp?.label || 'Unknown employee';
};


const errors = reactive<Record<string,string | undefined>>({});
const isValid = ref(false);
const submitting = ref(false);

function validateField(name: keyof JobFormState) {
  schema.validateAt(name, form)
    .then(() => { errors[name] = undefined; computeValid(); })
    .catch(e => { errors[name] = e.message; computeValid(); });
}
function validateAll() {
  schema.validate(form, { abortEarly: false })
    .then(() => { Object.keys(errors).forEach(k => errors[k] = undefined); isValid.value = true; })
    .catch(e => {
      const byField: Record<string,string> = {};
      if (e.inner) for (const err of e.inner) { if (!byField[err.path]) byField[err.path] = err.message; }
      Object.assign(errors, byField);
      isValid.value = false;
    });
}
function computeValid() {
  // quick check: all current errors undefined & all required fields truthy
  isValid.value = ['title','estimatedComplexity','price','assignedEmployeeId'].every(f => (form as any)[f] !== '' && (form as any)[f] !== null && !errors[f]);
}

watch(form, () => { validateAll(); }, { deep: true });

// Convertir assignedEmployeeId de string a number cuando cambie
watch(() => form.assignedEmployeeId, (value) => {
  if (typeof value === 'string' && value !== '') {
    form.assignedEmployeeId = Number(value);
  }
});

const toast = useToast();
const { updateJob, loading, error, onDone } = useUpdateJob(props.projectId);

onDone((result) => {
  submitting.value = false;
  if (result?.data?.updateJob) {
    toast.add({
      title: 'Success!',
      description: `Job "${result.data.updateJob.title}" updated successfully`,
      color: 'success',
      icon: 'i-heroicons-check-circle'
    });
    emit('saved');
  }
});

// Watch for errors
watch(error, (err) => {
  if (err) {
    submitting.value = false;
    toast.add({
      title: 'Error updating',
      description: err.message || 'An unexpected error occurred',
      color: 'error',
      icon: 'i-heroicons-x-circle'
    });
  }
});

function onSubmit() {
  validateAll();
  if (!isValid.value || !props.jobId) return;
  
  submitting.value = true;
  updateJob(Number(props.jobId), {
    title: form.title,
    estimatedComplexity: form.estimatedComplexity ?? undefined,
    price: form.price ?? undefined,
    assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : undefined,
  });
}

function reset() {
  form.title = '';
  form.estimatedComplexity = 1;
  form.price = 0;
  form.assignedEmployeeId = employeeOptions.value[0]?.value || null;
  validateAll();
}

// Pre-carga de datos del job al abrir para edición
const initializedFromJob = ref(false);
watch(() => props.jobId, () => {
  // si cambia el ID de job, permitimos nueva inicialización
  initializedFromJob.value = false;
});
watch(() => props.job, (job) => {
  if (!job || !props.jobId || initializedFromJob.value) return;
  // Copiamos valores iniciales del job seleccionado
  form.title = job.title ?? '';
  form.estimatedComplexity = job.estimatedComplexity ?? 1;
  form.price = job.price ?? 0;
  // asignamos empleado si existe
  const employeeId = job.assignedEmployeeId || job.assignedEmployee?.id;
  if (employeeId) form.assignedEmployeeId = employeeId;
  initializedFromJob.value = true;
  validateAll();
}, { immediate: true });

// Cuando cargan empleados y no hay empleado seleccionado válido, asignamos el primero
watch(employeeOptions, (opts) => {
  if (!opts.length) return;
  const exists = opts.some(o => o.value.toString() === form.assignedEmployeeId?.toString());
  if (!exists && opts[0]) {
    form.assignedEmployeeId = opts[0].value;
    validateField('assignedEmployeeId');
  }
});

// Track original employee ID when job is loaded
watch(() => props.job, (job) => {
  if (job) {
    originalEmployeeId.value = job.assignedEmployeeId || job.assignedEmployee?.id || null;
  }
}, { immediate: true });

// Handle employee change with confirmation
function onEmployeeChange() {
  const newEmployeeId = Number(form.assignedEmployeeId);
  
  if (originalEmployeeId.value && originalEmployeeId.value !== newEmployeeId && originalEmployeeId.value !== null) {
    // Show confirmation dialog if reassigning
    pendingEmployeeId.value = newEmployeeId;
    console.log('onEmployeeChange - pendingEmployeeId set to:', pendingEmployeeId.value);
    showConfirmation.value = true;
    // Temporarily revert to original
    form.assignedEmployeeId = originalEmployeeId.value;
  }
  validateField('assignedEmployeeId');
}

function confirmReassignment() {
  if (pendingEmployeeId.value) {
    form.assignedEmployeeId = pendingEmployeeId.value;
    validateField('assignedEmployeeId');
  }
  showConfirmation.value = false;
  pendingEmployeeId.value = null;
}

function cancelReassignment() {
  showConfirmation.value = false;
  pendingEmployeeId.value = null;
  // Keep original assignment
}
</script>

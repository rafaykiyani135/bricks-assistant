import { computed, type Ref } from 'vue';

/**
 * Composable to calculate employee availability based on current job assignments
 *
 * An employee is considered "unavailable" if they are already assigned to a job
 * within the current project context.
 *
 * @param employees - List of all employees
 * @param currentJobs - List of jobs in the current context (e.g., all jobs in a project)
 * @param excludeJobId - Optional job ID to exclude from availability check (useful when editing)
 */

interface Employee {
  id: number;
  name: string;
  [key: string]: any;
}

interface Job {
  id: number;
  assignedEmployee?: {
    id: number;
    name: string;
  };
  assignedEmployeeId?: number;
}

export function useEmployeeAvailability(
  employees: Ref<Employee[]>,
  currentJobs: Ref<Job[]> = ref([]),
  excludeJobId?: Ref<number | undefined>
) {
  /**
   * Get list of employee IDs that are currently assigned to jobs
   */
  const assignedEmployeeIds = computed(() => {
    const jobs = currentJobs.value || [];
    const excludeId = excludeJobId?.value;

    return jobs
      .filter(job => {
        // Exclude the current job being edited
        if (excludeId && job.id === excludeId) return false;
        return true;
      })
      .map(job => job.assignedEmployee?.id || job.assignedEmployeeId)
      .filter((id): id is number => id !== undefined && id !== null);
  });

  /**
   * Check if a specific employee is available
   */
  const isEmployeeAvailable = (employeeId: number): boolean => {
    return !assignedEmployeeIds.value.includes(employeeId);
  };

  /**
   * Get employees with calculated availability
   */
  const employeesWithAvailability = computed(() => {
    return employees.value.map(employee => ({
      ...employee,
      available: isEmployeeAvailable(employee.id),
    }));
  });

  /**
   * Get only available employees
   */
  const availableEmployees = computed(() => {
    return employeesWithAvailability.value.filter(emp => emp.available);
  });

  /**
   * Get only unavailable employees
   */
  const unavailableEmployees = computed(() => {
    return employeesWithAvailability.value.filter(emp => !emp.available);
  });

  return {
    assignedEmployeeIds,
    isEmployeeAvailable,
    employeesWithAvailability,
    availableEmployees,
    unavailableEmployees,
  };
}

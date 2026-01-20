import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';
import gql from 'graphql-tag';

// Basic contract:
// Output: employees (Ref<Employee[]>), loading (Ref<boolean>), error (Ref<Error | null>)
// Behavior: fetch once on composable use, refetch helper exposed.
// Error: network/auth errors captured in error ref.

interface Employee {
  id: number;
  name: string;
  role: string;
  hourlyCost: number;
  available?: boolean;
}

const EMPLOYEES_QUERY = gql`
  query Employees {
    employees {
      id
      name
      role
      hourlyCost
    }
  }
`;

export function useEmployees() {
  const { result, loading, error, refetch } = useQuery(EMPLOYEES_QUERY);
  const employees = computed<Employee[]>(() => result.value?.employees ?? []);
  return { employees, loading, error, refetch };
}

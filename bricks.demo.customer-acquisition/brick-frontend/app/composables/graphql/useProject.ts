import gql from 'graphql-tag';
import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';

const PROJECT_QUERY = gql`
  query Project($id: Int!) {
    project(id: $id) {
      id
      name
      client
      totalCost
      expectedRevenue
      netMargin
      estimatedEndDate
      startDate
      jobs { id title price category estimatedComplexity assignedEmployee { id name } }
    }
  }
`;

export function useProject(id: number) {
  const { result, loading, error, refetch } = useQuery(PROJECT_QUERY, { id });
  const project = computed(() => result.value?.project);
  return { project, loading, error, refetch };
}

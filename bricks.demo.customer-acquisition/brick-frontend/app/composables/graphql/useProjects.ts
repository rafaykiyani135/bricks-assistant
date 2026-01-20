import gql from 'graphql-tag';
import { useQuery } from '@vue/apollo-composable';
import { computed } from 'vue';

// Query document (reuses fields for list)
const PROJECTS_QUERY = gql`
  query Projects {
    projects { id name client totalCost expectedRevenue netMargin }
  }
`;

export function useProjects() {
  const { result, loading, error, refetch } = useQuery(PROJECTS_QUERY);
  const projects = computed(() => result.value?.projects || []);
  return { projects, loading, error, refetch };
}

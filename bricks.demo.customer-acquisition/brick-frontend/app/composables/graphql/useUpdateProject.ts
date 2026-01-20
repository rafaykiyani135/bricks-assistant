import gql from 'graphql-tag';
import { useMutation, useApolloClient } from '@vue/apollo-composable';

const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: Int!, $name: String, $client: String, $startDate: String, $estimatedEndDate: String) {
    updateProject(id: $id, name: $name, client: $client, startDate: $startDate, estimatedEndDate: $estimatedEndDate) {
      id
      name
      client
      startDate
      estimatedEndDate
      totalCost
      expectedRevenue
      netMargin
    }
  }
`;

export interface UpdateProjectInput {
  name?: string;
  client?: string;
  startDate?: string;
  estimatedEndDate?: string;
}

export function useUpdateProject() {
  const { mutate, loading, error, onDone } = useMutation(UPDATE_PROJECT_MUTATION, {
    errorPolicy: 'all',
    refetchQueries: ['Project', 'Projects'],
    awaitRefetchQueries: true,
  });

  const updateProject = async (id: number, input: UpdateProjectInput) => {
    try {
      const result = await mutate({
        id,
        name: input.name,
        client: input.client,
        startDate: input.startDate,
        estimatedEndDate: input.estimatedEndDate,
      });

      return result;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  return { updateProject, loading, error, onDone };
}

import gql from 'graphql-tag';
import { useMutation } from '@vue/apollo-composable';

const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($name: String!, $client: String!, $startDate: String!, $estimatedEndDate: String!) {
    createProject(name: $name, client: $client, startDate: $startDate, estimatedEndDate: $estimatedEndDate) {
      id
      name
      client
    }
  }
`;

export interface CreateProjectInput {
  name: string;
  client: string;
  startDate: string;
  estimatedEndDate: string;
}

export function useCreateProject() {
  const { mutate, loading, error, onDone } = useMutation(CREATE_PROJECT_MUTATION);
  
  const createProject = async (input: CreateProjectInput) => {
    const variables = {
      name: input.name,
      client: input.client,
      startDate: input.startDate,
      estimatedEndDate: input.estimatedEndDate
    };
    
    return mutate(variables);
  };
  
  return { createProject, loading, error, onDone };
}
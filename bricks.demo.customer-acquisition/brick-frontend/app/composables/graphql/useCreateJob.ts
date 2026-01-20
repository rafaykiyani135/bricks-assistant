import gql from 'graphql-tag';
import { useMutation } from '@vue/apollo-composable';

const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($title: String!, $category: JobCategory!, $estimatedComplexity: Float!, $price: Float!, $projectId: Int!, $assignedEmployeeId: Int) {
    createJob(title: $title, category: $category, estimatedComplexity: $estimatedComplexity, price: $price, projectId: $projectId, assignedEmployeeId: $assignedEmployeeId) {
      id
      title
      category
      estimatedComplexity
      price
      assignedEmployeeId
      projectId
    }
  }
`;

export interface CreateJobInput {
  title: string;
  category: string;
  estimatedComplexity: number;
  price: number;
  assignedEmployeeId?: number;
  projectId: number;
}

export function useCreateJob() {
  const { mutate, loading, error, onDone } = useMutation(CREATE_JOB_MUTATION);
  
  const createJob = async (input: CreateJobInput) => {
    const variables: any = {
      title: input.title,
      category: input.category,
      estimatedComplexity: input.estimatedComplexity,
      price: input.price,
      projectId: input.projectId
    };
    
    // Solo incluir assignedEmployeeId si tiene valor
    if (input.assignedEmployeeId) {
      variables.assignedEmployeeId = input.assignedEmployeeId;
    }
    
    return mutate(variables);
  };
  
  return { createJob, loading, error, onDone };
}
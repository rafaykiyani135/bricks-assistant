import gql from 'graphql-tag';
import { useMutation, useApolloClient } from '@vue/apollo-composable';

const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob(
    $id: Int!, 
    $title: String, 
    $category: JobCategory, 
    $estimatedComplexity: Float, 
    $price: Float, 
    $assignedEmployeeId: Int
  ) {
    updateJob(
      id: $id, 
      title: $title, 
      category: $category, 
      estimatedComplexity: $estimatedComplexity, 
      price: $price, 
      assignedEmployeeId: $assignedEmployeeId
    ) {
      id
      title
      price
      estimatedComplexity
      assignedEmployee { id name }
    }
  }
`;

export interface UpdateJobInput {
  title?: string;
  category?: string;
  price?: number;
  estimatedComplexity?: number;
  assignedEmployeeId?: number;
}

export function useUpdateJob(projectId?: number) {
  const { resolveClient } = useApolloClient();
  
  const { mutate, loading, error, onDone } = useMutation(UPDATE_JOB_MUTATION, {
    errorPolicy: 'all'
  });
  
  const updateJob = async (id: number, input: UpdateJobInput) => {
    try {
      const result = await mutate({ 
        id, 
        title: input.title,
        category: input.category,
        estimatedComplexity: input.estimatedComplexity,
        price: input.price,
        assignedEmployeeId: input.assignedEmployeeId
      });
      
      // Invalidar cache del proyecto después de la mutación exitosa
      if (result && projectId) {
        const client = resolveClient();
        // Invalidar todas las queries relacionadas con el proyecto
        await client.refetchQueries({
          include: ['GetProjectById', 'GetProjects'],
          updateCache(cache) {
            // Evict el proyecto específico del cache
            cache.evict({ 
              id: `Project:${projectId}` 
            });
            // Limpiar el garbage collection del cache
            cache.gc();
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  };
  
  return { updateJob, loading, error, onDone };
}

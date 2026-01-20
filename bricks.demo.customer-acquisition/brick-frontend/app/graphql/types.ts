import gql from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from 'vue';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type ReactiveFunction<TParam> = () => TParam;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type CreateEmployeeInput = {
  hourlyCost: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  productivity: Scalars['Float']['input'];
  role: Scalars['String']['input'];
};

export type CreateProjectInput = {
  client: Scalars['String']['input'];
  estimatedEndDate: Scalars['String']['input'];
  name: Scalars['String']['input'];
  startDate: Scalars['String']['input'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  employeeId: Scalars['Int']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Employee = {
  __typename?: 'Employee';
  firstName: Scalars['String']['output'];
  hourlyCost: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  jobs?: Maybe<Array<Job>>;
  lastName: Scalars['String']['output'];
  name: Scalars['String']['output'];
  productivity: Scalars['Float']['output'];
  role: Scalars['String']['output'];
};

export type Job = {
  __typename?: 'Job';
  assignedEmployee?: Maybe<Employee>;
  assignedEmployeeId?: Maybe<Scalars['ID']['output']>;
  category: Scalars['String']['output'];
  employee?: Maybe<Employee>;
  estimatedComplexity: Scalars['Float']['output'];
  estimatedCost?: Maybe<Scalars['Float']['output']>;
  estimatedDuration?: Maybe<Scalars['Float']['output']>;
  estimatedEndDate: Scalars['String']['output'];
  estimatedStartDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  price: Scalars['Float']['output'];
  project: Project;
  projectId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

/** Categoría de un trabajo */
export enum JobCategory {
  Carpentry = 'CARPENTRY',
  Electrical = 'ELECTRICAL',
  Other = 'OTHER',
  Painting = 'PAINTING',
  Plumbing = 'PLUMBING',
}

export type LoginResponse = {
  __typename?: 'LoginResponse';
  employee: Employee;
  token: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createEmployee: Employee;
  createJob: Job;
  createProject: Project;
  createUser: UserType;
  deleteEmployee: Scalars['Boolean']['output'];
  deleteJob: Scalars['Boolean']['output'];
  deleteProject: Scalars['Boolean']['output'];
  login: LoginResponse;
  seed: Scalars['Boolean']['output'];
  updateEmployee: Employee;
  updateJob: Job;
  updateProject: Project;
};

export type MutationCreateEmployeeArgs = {
  input: CreateEmployeeInput;
};

export type MutationCreateJobArgs = {
  assignedEmployeeId?: InputMaybe<Scalars['Int']['input']>;
  category: JobCategory;
  estimatedComplexity: Scalars['Float']['input'];
  price: Scalars['Float']['input'];
  projectId: Scalars['Int']['input'];
  title: Scalars['String']['input'];
};

export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDeleteEmployeeArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteJobArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteProjectArgs = {
  id: Scalars['Int']['input'];
};

export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MutationUpdateEmployeeArgs = {
  input: UpdateEmployeeInput;
};

export type MutationUpdateJobArgs = {
  id: Scalars['Int']['input'];
  input: UpdateJobInput;
};

export type MutationUpdateProjectArgs = {
  client?: InputMaybe<Scalars['String']['input']>;
  estimatedEndDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type Project = {
  __typename?: 'Project';
  client?: Maybe<Scalars['String']['output']>;
  estimatedEndDate?: Maybe<Scalars['String']['output']>;
  expectedRevenue?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  jobs: Array<Job>;
  name: Scalars['String']['output'];
  netMargin?: Maybe<Scalars['Float']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  totalCost?: Maybe<Scalars['Float']['output']>;
  totalPrice?: Maybe<Scalars['Float']['output']>;
};

export type Query = {
  __typename?: 'Query';
  allProjectSummaries: Array<QuoteSummary>;
  employee: Employee;
  employees: Array<Employee>;
  employeesByIds: Array<Employee>;
  job: Job;
  jobs: Array<Job>;
  me: UserType;
  project: Project;
  projects: Array<Project>;
  quoteSummary: QuoteSummary;
};

export type QueryEmployeeArgs = {
  id: Scalars['ID']['input'];
};

export type QueryEmployeesByIdsArgs = {
  ids: Array<Scalars['ID']['input']>;
};

export type QueryJobArgs = {
  id: Scalars['Int']['input'];
};

export type QueryProjectArgs = {
  id: Scalars['Int']['input'];
};

export type QueryQuoteSummaryArgs = {
  projectId: Scalars['Int']['input'];
};

export type QuoteSummary = {
  __typename?: 'QuoteSummary';
  expectedRevenue: Scalars['Float']['output'];
  jobs: Array<Job>;
  netMargin: Scalars['Float']['output'];
  project: Project;
  totalCost: Scalars['Float']['output'];
};

export type UpdateEmployeeInput = {
  hourlyCost?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  productivity?: InputMaybe<Scalars['Float']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateJobInput = {
  assignedEmployeeId?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<JobCategory>;
  estimatedComplexity?: InputMaybe<Scalars['Float']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UserType = {
  __typename?: 'UserType';
  email: Scalars['String']['output'];
  employee: Employee;
  id: Scalars['Int']['output'];
  username: Scalars['String']['output'];
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'UserType';
    id: number;
    email: string;
    username: string;
    employee: { __typename?: 'Employee'; id: string; name: string; role: string };
  };
};

export type ProjectsQueryVariables = Exact<{ [key: string]: never }>;

export type ProjectsQuery = {
  __typename?: 'Query';
  projects: Array<{
    __typename?: 'Project';
    id: string;
    name: string;
    client?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    totalCost?: number | null;
    expectedRevenue?: number | null;
    netMargin?: number | null;
  }>;
};

export type AllProjectSummariesQueryVariables = Exact<{ [key: string]: never }>;

export type AllProjectSummariesQuery = {
  __typename?: 'Query';
  allProjectSummaries: Array<{
    __typename?: 'QuoteSummary';
    totalCost: number;
    expectedRevenue: number;
    netMargin: number;
    project: {
      __typename?: 'Project';
      id: string;
      name: string;
      client?: string | null;
      startDate?: string | null;
      estimatedEndDate?: string | null;
    };
    jobs: Array<{
      __typename?: 'Job';
      id: string;
      title: string;
      price: number;
      estimatedComplexity: number;
      assignedEmployee?: { __typename?: 'Employee'; id: string; name: string } | null;
    }>;
  }>;
};

export type ProjectQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type ProjectQuery = {
  __typename?: 'Query';
  project: {
    __typename?: 'Project';
    id: string;
    name: string;
    client?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    totalCost?: number | null;
    expectedRevenue?: number | null;
    netMargin?: number | null;
    jobs: Array<{
      __typename?: 'Job';
      id: string;
      title: string;
      price: number;
      estimatedComplexity: number;
      assignedEmployee?: { __typename?: 'Employee'; id: string; name: string } | null;
    }>;
  };
};

export type UpdateJobMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateJobInput;
}>;

export type UpdateJobMutation = {
  __typename?: 'Mutation';
  updateJob: {
    __typename?: 'Job';
    id: string;
    title: string;
    price: number;
    estimatedComplexity: number;
    assignedEmployee?: { __typename?: 'Employee'; id: string; name: string } | null;
  };
};

export type CreateProjectMutationVariables = Exact<{
  input: CreateProjectInput;
}>;

export type CreateProjectMutation = {
  __typename?: 'Mutation';
  createProject: {
    __typename?: 'Project';
    id: string;
    name: string;
    client?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    totalCost?: number | null;
    expectedRevenue?: number | null;
    netMargin?: number | null;
  };
};

export type UpdateProjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  client?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  estimatedEndDate?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateProjectMutation = {
  __typename?: 'Mutation';
  updateProject: {
    __typename?: 'Project';
    id: string;
    name: string;
    client?: string | null;
    startDate?: string | null;
    estimatedEndDate?: string | null;
    totalCost?: number | null;
    expectedRevenue?: number | null;
    netMargin?: number | null;
  };
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'LoginResponse';
    token: string;
    employee: { __typename?: 'Employee'; id: string; firstName: string; lastName: string };
  };
};

export const MeDocument = gql`
  query Me {
    me {
      id
      email
      username
      employee {
        id
        name
        role
      }
    }
  }
`;

/**
 * __useMeQuery__
 *
 * To run a query within a Vue component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useMeQuery();
 */
export function useMeQuery(
  options:
    | VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>> = {}
) {
  return VueApolloComposable.useQuery<MeQuery, MeQueryVariables>(MeDocument, {}, options);
}
export function useMeLazyQuery(
  options:
    | VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>
    | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>>
    | ReactiveFunction<VueApolloComposable.UseQueryOptions<MeQuery, MeQueryVariables>> = {}
) {
  return VueApolloComposable.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, {}, options);
}
export type MeQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  MeQuery,
  MeQueryVariables
>;
export const ProjectsDocument = gql`
  query Projects {
    projects {
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

/**
 * __useProjectsQuery__
 *
 * To run a query within a Vue component, call `useProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectsQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useProjectsQuery();
 */
export function useProjectsQuery(
  options:
    | VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
      > = {}
) {
  return VueApolloComposable.useQuery<ProjectsQuery, ProjectsQueryVariables>(
    ProjectsDocument,
    {},
    options
  );
}
export function useProjectsLazyQuery(
  options:
    | VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<ProjectsQuery, ProjectsQueryVariables>
      > = {}
) {
  return VueApolloComposable.useLazyQuery<ProjectsQuery, ProjectsQueryVariables>(
    ProjectsDocument,
    {},
    options
  );
}
export type ProjectsQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  ProjectsQuery,
  ProjectsQueryVariables
>;
export const AllProjectSummariesDocument = gql`
  query AllProjectSummaries {
    allProjectSummaries {
      project {
        id
        name
        client
        startDate
        estimatedEndDate
      }
      jobs {
        id
        title
        price
        estimatedComplexity
        assignedEmployee {
          id
          name
        }
      }
      totalCost
      expectedRevenue
      netMargin
    }
  }
`;

/**
 * __useAllProjectSummariesQuery__
 *
 * To run a query within a Vue component, call `useAllProjectSummariesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllProjectSummariesQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useAllProjectSummariesQuery();
 */
export function useAllProjectSummariesQuery(
  options:
    | VueApolloComposable.UseQueryOptions<
        AllProjectSummariesQuery,
        AllProjectSummariesQueryVariables
      >
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          AllProjectSummariesQuery,
          AllProjectSummariesQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          AllProjectSummariesQuery,
          AllProjectSummariesQueryVariables
        >
      > = {}
) {
  return VueApolloComposable.useQuery<AllProjectSummariesQuery, AllProjectSummariesQueryVariables>(
    AllProjectSummariesDocument,
    {},
    options
  );
}
export function useAllProjectSummariesLazyQuery(
  options:
    | VueApolloComposable.UseQueryOptions<
        AllProjectSummariesQuery,
        AllProjectSummariesQueryVariables
      >
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<
          AllProjectSummariesQuery,
          AllProjectSummariesQueryVariables
        >
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<
          AllProjectSummariesQuery,
          AllProjectSummariesQueryVariables
        >
      > = {}
) {
  return VueApolloComposable.useLazyQuery<
    AllProjectSummariesQuery,
    AllProjectSummariesQueryVariables
  >(AllProjectSummariesDocument, {}, options);
}
export type AllProjectSummariesQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  AllProjectSummariesQuery,
  AllProjectSummariesQueryVariables
>;
export const ProjectDocument = gql`
  query Project($id: Int!) {
    project(id: $id) {
      id
      name
      client
      startDate
      estimatedEndDate
      totalCost
      expectedRevenue
      netMargin
      jobs {
        id
        title
        price
        estimatedComplexity
        assignedEmployee {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useProjectQuery__
 *
 * To run a query within a Vue component, call `useProjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useProjectQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useProjectQuery({
 *   id: // value for 'id'
 * });
 */
export function useProjectQuery(
  variables:
    | ProjectQueryVariables
    | VueCompositionApi.Ref<ProjectQueryVariables>
    | ReactiveFunction<ProjectQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
      > = {}
) {
  return VueApolloComposable.useQuery<ProjectQuery, ProjectQueryVariables>(
    ProjectDocument,
    variables,
    options
  );
}
export function useProjectLazyQuery(
  variables?:
    | ProjectQueryVariables
    | VueCompositionApi.Ref<ProjectQueryVariables>
    | ReactiveFunction<ProjectQueryVariables>,
  options:
    | VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
    | VueCompositionApi.Ref<
        VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
      >
    | ReactiveFunction<
        VueApolloComposable.UseQueryOptions<ProjectQuery, ProjectQueryVariables>
      > = {}
) {
  return VueApolloComposable.useLazyQuery<ProjectQuery, ProjectQueryVariables>(
    ProjectDocument,
    variables,
    options
  );
}
export type ProjectQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<
  ProjectQuery,
  ProjectQueryVariables
>;
export const UpdateJobDocument = gql`
  mutation UpdateJob($id: Int!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      title
      price
      estimatedComplexity
      assignedEmployee {
        id
        name
      }
    }
  }
`;

/**
 * __useUpdateJobMutation__
 *
 * To run a mutation, you first call `useUpdateJobMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateJobMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateJobMutation({
 *   variables: {
 *     id: // value for 'id'
 *     input: // value for 'input'
 *   },
 * });
 */
export function useUpdateJobMutation(
  options:
    | VueApolloComposable.UseMutationOptions<UpdateJobMutation, UpdateJobMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<UpdateJobMutation, UpdateJobMutationVariables>
      > = {}
) {
  return VueApolloComposable.useMutation<UpdateJobMutation, UpdateJobMutationVariables>(
    UpdateJobDocument,
    options
  );
}
export type UpdateJobMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  UpdateJobMutation,
  UpdateJobMutationVariables
>;
export const CreateProjectDocument = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
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

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useCreateProjectMutation({
 *   variables: {
 *     input: // value for 'input'
 *   },
 * });
 */
export function useCreateProjectMutation(
  options:
    | VueApolloComposable.UseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          CreateProjectMutation,
          CreateProjectMutationVariables
        >
      > = {}
) {
  return VueApolloComposable.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(
    CreateProjectDocument,
    options
  );
}
export type CreateProjectMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  CreateProjectMutation,
  CreateProjectMutationVariables
>;
export const UpdateProjectDocument = gql`
  mutation UpdateProject(
    $id: Int!
    $name: String
    $client: String
    $startDate: String
    $estimatedEndDate: String
  ) {
    updateProject(
      id: $id
      name: $name
      client: $client
      startDate: $startDate
      estimatedEndDate: $estimatedEndDate
    ) {
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

/**
 * __useUpdateProjectMutation__
 *
 * To run a mutation, you first call `useUpdateProjectMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProjectMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateProjectMutation({
 *   variables: {
 *     id: // value for 'id'
 *     name: // value for 'name'
 *     client: // value for 'client'
 *     startDate: // value for 'startDate'
 *     estimatedEndDate: // value for 'estimatedEndDate'
 *   },
 * });
 */
export function useUpdateProjectMutation(
  options:
    | VueApolloComposable.UseMutationOptions<UpdateProjectMutation, UpdateProjectMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<
          UpdateProjectMutation,
          UpdateProjectMutationVariables
        >
      > = {}
) {
  return VueApolloComposable.useMutation<UpdateProjectMutation, UpdateProjectMutationVariables>(
    UpdateProjectDocument,
    options
  );
}
export type UpdateProjectMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  UpdateProjectMutation,
  UpdateProjectMutationVariables
>;
export const LoginDocument = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      employee {
        id
        firstName
        lastName
      }
    }
  }
`;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useLoginMutation({
 *   variables: {
 *     email: // value for 'email'
 *     password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(
  options:
    | VueApolloComposable.UseMutationOptions<LoginMutation, LoginMutationVariables>
    | ReactiveFunction<
        VueApolloComposable.UseMutationOptions<LoginMutation, LoginMutationVariables>
      > = {}
) {
  return VueApolloComposable.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    options
  );
}
export type LoginMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<
  LoginMutation,
  LoginMutationVariables
>;

import { useMutation, useQuery, useApolloClient } from '@vue/apollo-composable';
import { gql } from 'graphql-tag';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      employee {
        id
        name
      }
    }
  }
`;

const ME_QUERY = gql`
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

export const useAuth = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const { mutate: loginMutation, loading, error } = useMutation(LOGIN_MUTATION);

interface LoginResponse {
    login: {
        token: string;
        employee: {
            id: string;
            name: string;
        };
    };
}

interface LoginVariables {
    email: string;
    password: string;
}

const login = async (email: string, password: string): Promise<void> => {
    try {
        const { data } = await loginMutation({ email, password }) as { data: LoginResponse };
        if (data.login.token) {
            // Persistencia en localStorage para acceso rápido en cliente
            if (process.client) {
              localStorage.setItem('token', data.login.token);
            }
            // Cookie para SSR y middleware (nombre alineado con nuxt.config tokenName)
            const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' });
            authCookie.value = data.login.token;
            router.push('/');
        }
    } catch (e: unknown) {
        console.error('Login failed:', e);
    }
};

  const logout = () => {
    if (process.client) {
      localStorage.removeItem('token');
    }
    const authCookie = useCookie<string | null>('auth_token');
    authCookie.value = null;
    apolloClient.client.clearStore();
    router.push('/login');
  };

  // Verificar si hay token para determinar si está autenticado
  const isAuthenticated = computed(() => {
    if (process.client) {
      return !!localStorage.getItem('token');
    }
    const authCookie = useCookie<string | null>('auth_token');
    return !!authCookie.value;
  });

  // Query para obtener información del usuario actual
  const { result: currentUserResult, loading: userLoading, refetch: refetchUser } = useQuery(
    ME_QUERY,
    {},
    {
      enabled: isAuthenticated,
      errorPolicy: 'ignore'
    }
  );

  const currentUser = computed(() => currentUserResult.value?.me || null);

  return {
    login,
    logout,
    loading,
    error,
    isAuthenticated,
    currentUser,
    userLoading,
    refetchUser,
  };
};

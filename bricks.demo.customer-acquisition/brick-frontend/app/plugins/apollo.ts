import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';
import { defineNuxtPlugin } from '#app';
import { SetContextLink } from '@apollo/client/link/context';

export default defineNuxtPlugin(() => {
  const authLink = new SetContextLink((prevContext) => {
    const authStore = useAuthStore();
    return {
      headers: {
        ...prevContext.headers,
        authorization: `Bearer ${authStore.accessToken}`,
      },
    };
  });
  const apollo = new ApolloClient({
    link: HttpLink.from([
      authLink,
      new HttpLink({
        uri: 'http://localhost:3001/graphql',
      }),
    ]),
    cache: new InMemoryCache(),
  });

  return {
    provide: {
      apollo,
    },
  };
});

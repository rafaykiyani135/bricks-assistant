// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: { port: 3001 },
  // Desactiva el panel lateral de Nuxt DevTools en desarrollo (causa del sidebar al enfocar inputs)
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@nuxtjs/apollo', '@nuxtjs/color-mode'],
  colorMode: {
    preference: 'dark', // Usar modo oscuro por defecto
    fallback: 'dark', // Fallback al modo oscuro si no se puede detectar
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode',
  },
  // Configuración del módulo Apollo (v5 alpha)
  // Si el warning persiste, verificar versión y documentación del módulo.
  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.NUXT_GRAPHQL_ENDPOINT || 'http://localhost:3004/graphql',
        tokenStorage: 'cookie', // usamos cookie para que SSR pueda leer el token
        // Estas opciones de auth permiten que el módulo construya automáticamente el header si encuentra el token.
        authHeader: 'Authorization',
        authType: 'Bearer',
        tokenName: 'auth_token', // nombre de la cookie/localStorage que usaremos
        defaultOptions: {
          watchQuery: { fetchPolicy: 'cache-and-network' },
          query: { fetchPolicy: 'network-only' },
          mutate: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
          },
        },
        devtools: {
          enabled: false,
        },
      },
    },
    // Desactivar features no usadas inicialmente
    enableAutomaticPersistedQueries: false,
  } as any,
  css: ['./app/assets/css/fonts.css'],
});

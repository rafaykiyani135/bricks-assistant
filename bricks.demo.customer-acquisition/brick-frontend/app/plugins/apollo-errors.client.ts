import { defineNuxtPlugin } from 'nuxt/app'
import { onError } from '@apollo/client/link/error'
import type { ApolloClient } from '@apollo/client/core'

// Mapeo simple de códigos a mensajes user-friendly
function humanizeError(message: string, code?: string): string {
  if (code === 'UNAUTHENTICATED') return 'No autorizado. Inicia sesión.'
  if (code === 'FORBIDDEN') return 'Acceso denegado.'
  return message
}

export default defineNuxtPlugin((nuxtApp) => {
  const client: ApolloClient<any> | undefined = (nuxtApp as any).$apollo?.defaultClient
  if (!client) return

  // Lazy import to avoid SSR mismatch (UToast is client-only)
  const toast = (nuxtApp as any).$ui?.toast || undefined

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const code = (err.extensions as any)?.code
        const msg = humanizeError(err.message, code)
        console.error('[GraphQL Error]', operation.operationName, code, err.message)
        if (code === 'UNAUTHENTICATED') {
          // Redirect to login
          ;(nuxtApp as any).$router.push('/login')
        }
        if (toast) {
          toast.add({ title: 'Error', description: msg, color: 'red', icon: 'i-lucide-alert-circle' })
        }
      }
    }
    if (networkError) {
      console.error('[Network Error]', operation.operationName, networkError)
      if (toast) {
        toast.add({ title: 'Network', description: 'Problema de conexión al servidor GraphQL', color: 'orange', icon: 'i-lucide-wifi-off' })
      }
    }
  })

  // @ts-ignore setLink exists on ApolloClient instance
  client.setLink(errorLink.concat(client.link))
})

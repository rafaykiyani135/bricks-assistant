import { defineNuxtPlugin } from 'nuxt/app'
import { setContext } from '@apollo/client/link/context'

export default defineNuxtPlugin((nuxtApp) => {
  const client: any = (nuxtApp as any).$apollo?.defaultClient
  if (!client) return

  // Auth link que inserta Authorization: Bearer <token>
  const authLink = setContext((_, { headers }) => {
    // Leer cookie SSR primero
    const authCookie = useCookie<string | null>('auth_token')
    let token = authCookie.value
    if (!token && process.client) {
      token = localStorage.getItem('token') || null
    }

    return {
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }
  })

  // Encadenamos auth primero, luego el resto de la cadena ya existente (error link, http link, etc.)
  client.setLink(authLink.concat(client.link))
})

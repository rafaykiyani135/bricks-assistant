import { defineNuxtPlugin } from 'nuxt/app'
import { useRouter } from 'vue-router'

export default defineNuxtPlugin(() => {
  const router = useRouter()
})

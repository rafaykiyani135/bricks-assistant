/**
 * App config - se carga muy temprano en el ciclo de vida de Nuxt
 * Suprime el warning de Apollo Client sobre connectToDevTools deprecado
 */

// Interceptar console.warn antes de que cualquier cosa se inicialice
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = (...args: any[]) => {
    const message = String(args[0] || '')

    // Filtrar warnings de Apollo Client sobre connectToDevTools
    if (
      message.includes('connectToDevTools') ||
    ) {
      // Ignorar este warning específico
      return
    }

    originalWarn.apply(console, args)
  }
}

export default defineAppConfig({
  // Configuración de la app si es necesaria
})

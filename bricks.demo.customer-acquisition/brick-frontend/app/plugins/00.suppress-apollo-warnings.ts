/**
 * Plugin de prioridad 0 (se ejecuta primero) para suprimir warnings de Apollo
 * El prefijo "00." asegura que este plugin se ejecute antes que otros
 */

// Interceptar console.warn inmediatamente, tanto en cliente como servidor
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  const message = String(args[0] || '')

  // Filtrar warnings de Apollo Client sobre connectToDevTools
  if (
    message.includes('connectToDevTools') 

  ) {
    // Ignorar este warning específico
    return
  }

  originalWarn.apply(console, args)
}

export default defineNuxtPlugin(() => {
  // Plugin ya activo
})

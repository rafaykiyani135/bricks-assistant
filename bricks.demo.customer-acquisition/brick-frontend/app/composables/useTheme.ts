export const useTheme = () => {
  const colorMode = useColorMode()

  // Función para alternar entre modo claro y oscuro
  const toggleTheme = () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  // Función para establecer un tema específico
  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    colorMode.preference = theme
  }

  // Obtener el tema actual
  const currentTheme = computed(() => colorMode.value)
  const isDark = computed(() => colorMode.value === 'dark')
  const isLight = computed(() => colorMode.value === 'light')

  return {
    toggleTheme,
    setTheme,
    currentTheme,
    isDark,
    isLight,
    colorMode
  }
}
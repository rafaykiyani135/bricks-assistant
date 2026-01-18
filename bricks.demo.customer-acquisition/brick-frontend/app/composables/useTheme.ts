export type Theme = 'red' | 'yellow' | 'blue' | 'green';

const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: Theme = 'blue';

export const useTheme = () => {
  const theme = useState<Theme>('theme', () => {
    if (import.meta.client) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      return stored || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
    if (import.meta.client) {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      applyTheme(newTheme);
    }
  };

  const applyTheme = (themeName: Theme) => {
    if (import.meta.client) {
      const html = document.documentElement;
      html.classList.remove(
        'theme-red',
        'theme-yellow',
        'theme-blue',
        'theme-green',
      );
      html.classList.add(`theme-${themeName}`);
    }
  };

  watch(
    theme,
    (newTheme) => {
      if (import.meta.client) {
        applyTheme(newTheme);
      }
    },
    { immediate: true },
  );

  return {
    theme: readonly(theme),
    setTheme,
  };
};

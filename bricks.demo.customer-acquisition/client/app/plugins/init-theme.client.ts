export default defineNuxtPlugin(() => {
  const THEME_STORAGE_KEY = 'app-theme';
  const DEFAULT_THEME = 'blue';

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;

  const html = document.documentElement;
  html.classList.remove(
    'theme-red',
    'theme-yellow',
    'theme-blue',
    'theme-green',
  );
  html.classList.add(`theme-${storedTheme}`);
});

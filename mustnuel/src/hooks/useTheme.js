

import { useApp } from '../context/AppContext';

export function useTheme() {
  const { theme, isDark, toggleTheme, setTheme } = useApp();
  return { theme, isDark, toggleTheme, setTheme };
}
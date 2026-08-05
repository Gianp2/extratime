import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  const initialTheme = (localStorage.getItem('extratime_theme') as Theme) || 'dark';
  const effectiveTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme;

  // Apply to html class
  if (typeof document !== 'undefined') {
    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return {
    theme: initialTheme,
    effectiveTheme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem('extratime_theme', newTheme);
      const effective = newTheme === 'system' ? getSystemTheme() : newTheme;
      if (effective === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ theme: newTheme, effectiveTheme: effective });
    },
    toggleTheme: () => {
      const current = get().effectiveTheme;
      const next = current === 'dark' ? 'light' : 'dark';
      get().setTheme(next);
    },
  };
});

/**
 * Theme Store using Svelte 5 runes
 * Manages light/dark theme with system preference detection
 */

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

let themeState = $state<ThemeState>({
  mode: 'system',
  isDark: false,
});

let mediaQuery: MediaQueryList | null = null;

/**
 * Initialize theme store
 */
export function initializeTheme(): void {
  // Load saved theme from localStorage
  const saved = localStorage.getItem('theme.mode') as ThemeMode | null;
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    themeState.mode = saved;
  } else {
    themeState.mode = 'system';
  }
  
  updateIsDark();
  
  // Listen for system preference changes
  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemChange);
  }
}

/**
 * Set theme mode
 */
export function setThemeMode(mode: ThemeMode): void {
  themeState.mode = mode;
  localStorage.setItem('theme.mode', mode);
  updateIsDark();
  applyThemeToDocument();
}

/**
 * Toggle between light and dark
 */
export function toggleTheme(): void {
  themeState.mode = themeState.isDark ? 'light' : 'dark';
  localStorage.setItem('theme.mode', themeState.mode);
  updateIsDark();
  applyThemeToDocument();
}

/**
 * Update isDark based on current mode and system preference
 */
function updateIsDark(): void {
  if (themeState.mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      themeState.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      themeState.isDark = false;
    }
  } else {
    themeState.isDark = themeState.mode === 'dark';
  }
}

/**
 * Handle system theme change
 */
function handleSystemChange(): void {
  if (themeState.mode === 'system') {
    updateIsDark();
    applyThemeToDocument();
  }
}

/**
 * Apply theme class to document
 */
function applyThemeToDocument(): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  if (themeState.isDark) {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
  } else {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
  }
}

/**
 * Reactive getters for component use
 */
export const themeStore = {
  get mode() {
    return themeState.mode;
  },
  get isDark() {
    return themeState.isDark;
  },
};

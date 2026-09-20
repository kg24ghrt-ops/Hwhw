/**
 * Theme Store - Svelte 5 runes-based store for theme state
 * Handles light/dark mode and system preference detection
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
}

const initialState: ThemeState = {
  mode: 'system',
  isDark: false,
};

export class ThemeStore {
  private state = $state<ThemeState>(initialState);
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    this.initialize();
  }

  get mode() {
    return this.state.mode;
  }

  get isDark() {
    return this.state.isDark;
  }

  private initialize(): void {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme.mode') as ThemeMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      this.state.mode = saved;
    }

    // Listen for system preference changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => this.updateSystemPreference());
    }

    this.updateIsDark();
  }

  setMode(mode: ThemeMode): void {
    this.state.mode = mode;
    localStorage.setItem('theme.mode', mode);
    this.updateIsDark();
  }

  toggle(): void {
    this.setMode(this.state.isDark ? 'light' : 'dark');
  }

  private updateSystemPreference(): void {
    if (this.state.mode === 'system') {
      this.updateIsDark();
    }
  }

  private updateIsDark(): void {
    if (this.state.mode === 'system') {
      if (this.mediaQuery) {
        this.state.isDark = this.mediaQuery.matches;
      } else if (typeof window !== 'undefined') {
        this.state.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } else {
      this.state.isDark = this.state.mode === 'dark';
    }

    // Apply to document
    this.applyToDocument();
  }

  private applyToDocument(): void {
    if (typeof document === 'undefined') return;

    if (this.state.isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }
}

// Singleton instance
export const themeStore = new ThemeStore();

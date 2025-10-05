export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'tm_theme'

export function getTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
    if (saved === 'light' || saved === 'dark') return saved
  } catch (_) {
    // ignore
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark' : 'light'
    } catch (_) {
      // ignore
    }
  }
  return 'light'
}

export function setTheme(t: ThemeMode): ThemeMode {
  try {
    localStorage.setItem(THEME_KEY, t)
  } catch (_) {
    // ignore
  }
  if (typeof document !== 'undefined') {
    const el = document.documentElement
    if (t === 'dark') el.classList.add('dark')
    else el.classList.remove('dark')
  }
  return t
}

export function initTheme(): ThemeMode {
  const t = getTheme()
  setTheme(t)
  return t
}


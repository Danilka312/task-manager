export type Tokens = { access: string; refresh?: string }

const KEY = 'tm_tokens'

export const setTokens = (t: Tokens): void => {
  localStorage.setItem(KEY, JSON.stringify(t))
}

export const getTokens = (): Tokens | null => {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as Tokens } catch { return null }
}

export const clearTokens = (): void => {
  localStorage.removeItem(KEY)
}

export const isAuthed = (): boolean => {
  return Boolean(getTokens()?.access)
}



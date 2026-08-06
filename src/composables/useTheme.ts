import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const theme = ref<Theme>('dark')
let initialized = false

function apply(t: Theme) {
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('os-theme', t)
  theme.value = t
}

export function useTheme() {
  if (!initialized) {
    initialized = true
    const saved = localStorage.getItem('os-theme') as Theme | null
    apply(saved === 'dark' || saved === 'light' ? saved : 'dark')
  }
  return { theme, toggle: () => apply(theme.value === 'dark' ? 'light' : 'dark'), setTheme: apply }
}

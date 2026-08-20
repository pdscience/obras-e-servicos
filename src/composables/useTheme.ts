import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const theme = ref<Theme>('light')
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
    apply(saved === 'dark' || saved === 'light' ? saved : 'light')
  }
  return { theme, toggle: () => apply(theme.value === 'dark' ? 'light' : 'dark'), setTheme: apply }
}

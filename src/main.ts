import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'
import './index.css'
import './styles/primevue.css'

// Inicializa o tema salvo (aplica data-theme no <html>)
useTheme()

const app = createApp(App)
const head = createHead()

app.use(createPinia())
app.use(router)
app.use(head)
app.use(PrimeVue, {
  unstyled: true,
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(VueApexCharts)

app.mount('#root')

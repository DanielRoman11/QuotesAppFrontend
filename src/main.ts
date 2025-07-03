import './assets/styles/main.css'

import App from '@/App.vue'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import { ToastService } from 'primevue'
import { router } from './config/router'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.p-dark',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(router)
app.mount('#app')

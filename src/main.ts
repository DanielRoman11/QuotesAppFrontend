import './assets/styles/main.css'

import Material from '@primeuix/themes/material'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'
import { ToastService } from 'primevue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Material,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})
app.use(ToastService)
app.mount('#app')

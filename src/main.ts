import './assets/styles/main.css'

import Material from '@primeuix/themes/material'
import PrimeVue from 'primevue/config'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Material,
    options: {
      darkModeSelector: '.p-dark',
    },
  },
})

app.mount('#app')

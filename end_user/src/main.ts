import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAppConfigStore } from './stores/appConfig'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// Initialize app config store early to set theme and language
useAppConfigStore()

app.mount('#app')

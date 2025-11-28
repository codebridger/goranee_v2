import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { useAppConfigStore } from './stores/appConfig'
import { initApiClient } from './services/api/init'
import { authService } from './services/api/auth'

/**
 * Initialize the application
 * This includes setting up the API client and authenticating as anonymous user
 */
async function initApp() {
  try {
    // Initialize API client with global options
    initApiClient()

    // Authenticate as anonymous user before mounting the app
    // This ensures we have a token for API requests
    await authService.loginAsAnonymous()

    // Create and configure Vue app
    const app = createApp(App)

    const pinia = createPinia()
    app.use(pinia)
    app.use(router)
    app.use(i18n)

    // Initialize app config store early to set theme and language
    useAppConfigStore()

    // Mount the app
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    // Show error to user or handle gracefully
    // For now, we'll still mount the app but API calls may fail
    const app = createApp(App)
    const pinia = createPinia()
    app.use(pinia)
    app.use(router)
    app.use(i18n)
    useAppConfigStore()
    app.mount('#app')
  }
}

// Start the application
initApp()

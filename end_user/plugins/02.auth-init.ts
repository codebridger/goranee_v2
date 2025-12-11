import { authentication } from '@modular-rest/client'

/**
 * Initialize anonymous authentication on client-side
 * This should run after the modular-rest plugin
 */
export default defineNuxtPlugin(async () => {
  try {
    // Authenticate as anonymous user before the app is fully mounted
    // This ensures we have a token for API requests
    await authentication.loginAsAnonymous()
  } catch (error) {
    console.error('Failed to login as anonymous:', error)
    // Continue anyway - API calls may fail but app should still work
  }
})



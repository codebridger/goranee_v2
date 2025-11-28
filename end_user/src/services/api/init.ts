import { GlobalOptions, authentication, dataProvider, fileProvider } from '@modular-rest/client'

/**
 * Initialize the Modular REST Client with global options
 * This should be called once at application startup
 */
export function initApiClient() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not defined in environment variables')
  }

  // Configure global options
  GlobalOptions.set({ host: baseUrl })

  // Return the configured services for use throughout the application
  return {
    authentication,
    dataProvider,
    fileProvider,
  }
}

// Export services for direct use
export { authentication, dataProvider, fileProvider }

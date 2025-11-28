import { GlobalOptions, authentication, dataProvider, fileProvider } from '@modular-rest/client'

/**
 * Initialize the Modular REST Client with global options
 * This plugin runs on both server and client side
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBaseUrl

  if (!baseUrl) {
    console.warn('NUXT_API_BASE_URL is not defined in environment variables')
    return
  }

  // Configure global options
  GlobalOptions.set({ host: baseUrl })

  // Provide services to the Nuxt app
  return {
    provide: {
      modularRest: {
        authentication,
        dataProvider,
        fileProvider,
      },
    },
  }
})



import { GlobalOptions, authentication, dataProvider, fileProvider } from '@modular-rest/client'
import { useDataCache } from '~/composables/useDataCache'

/**
 * Initialize the Modular REST Client with global options
 * This plugin runs on both server and client side
 */
export default defineNuxtPlugin((nuxtApp) => {
  const { generateKey, getCachedData, setCachedData, syncSsrToSessionStorage } = useDataCache()
  devLog('ModularRest', 'Initializing with Cache support');

  /**
   * Enhanced DataProvider with session-based caching.
   * We monkey-patch the original dataProvider methods to ensure that
   * even direct imports of dataProvider from @modular-rest/client 
   * benefit from the caching system.
   */
  const originalFind = dataProvider.find.bind(dataProvider)
  const originalFindOne = dataProvider.findOne.bind(dataProvider)

  dataProvider.find = async <T>(params: any): Promise<T[]> => {
    const key = generateKey({ type: 'find', ...params })
    const cached = getCachedData(key)
    if (cached) {
      devLog('DataProvider', 'Serving "find" from cache');
      return cached
    }

    devLog('DataProvider', '"find" cache miss, fetching from network...');
    const result = await originalFind<T>(params)
    setCachedData(key, result)
    return result
  }

  dataProvider.findOne = (async <T>(params: any): Promise<T> => {
    const key = generateKey({ type: 'findOne', ...params })
    const cached = getCachedData(key)
    if (cached) {
      devLog('DataProvider', 'Serving "findOne" from cache');
      return cached
    }

    devLog('DataProvider', '"findOne" cache miss, fetching from network...');
    const result = await originalFindOne<T>(params)
    setCachedData(key, result)
    return result as T
  }) as any

  // Sync SSR cache to sessionStorage when the app mounts on the client
  if (import.meta.client) {
    nuxtApp.hook('app:mounted', () => {
      syncSsrToSessionStorage()
    })
  }

  try {
    const config = useRuntimeConfig()
    let baseUrl = config.public.apiBaseUrl

    if (!baseUrl) {
      console.warn('[ModularRest] NUXT_API_BASE_URL is not defined in environment variables')
      return
    }

    // Normalize baseUrl - ensure it's a proper absolute path or full URL
    if (import.meta.client) {
      // Client-side: ALWAYS use full URL with origin to prevent relative path issues
      // This prevents issues when on routes like /tab/123 where relative URLs
      // would resolve to /tab/api/... instead of /api/...
      if (!baseUrl.startsWith('http')) {
        // Ensure it starts with / for absolute path
        baseUrl = baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl
        // Convert to full URL with origin - this ensures it's always absolute
        // This is critical to prevent relative URL resolution issues
        baseUrl = window.location.origin + baseUrl
      }
      console.log('[ModularRest] Client-side baseUrl set to:', baseUrl)
    } else {
      // Server-side (SSR): use internal Docker service URL
      // The server doesn't have /api prefix, so we connect directly
      if (!baseUrl.startsWith('http')) {
        // For SSR, connect directly to the server service (no /api prefix needed)
        baseUrl = 'http://server:8081'
      }
    }

    // Remove trailing slash if present
    baseUrl = baseUrl.replace(/\/$/, '')

    // Configure global options - this should be a full URL on client, or server URL on server
    GlobalOptions.set({ host: baseUrl })
    
    // Log configuration (only on client to avoid SSR spam)
    if (import.meta.client) {
      console.log('[ModularRest] GlobalOptions host configured:', baseUrl)
      // Double-check it's a full URL on client
      if (!baseUrl.startsWith('http')) {
        console.error('[ModularRest] ERROR: Host is not a full URL on client side!', baseUrl)
      }
    }
  } catch (error) {
    console.error('[ModularRest] Error initializing plugin:', error)
    // Don't throw - allow the app to continue even if plugin setup fails
  }

  // Provide services to the Nuxt app
  return {
    provide: {
      modularRest: {
        authentication,
        dataProvider, // Now monkey-patched
        fileProvider,
      },
    },
  }
})

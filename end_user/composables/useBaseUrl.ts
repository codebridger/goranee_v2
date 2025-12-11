/**
 * Composable to get the base URL dynamically based on the request
 * Works for both server-side (SSR) and client-side rendering
 * Handles Nginx proxy headers (x-forwarded-*) and direct requests
 * Returns a computed ref that updates reactively
 */
export const useBaseUrl = () => {
  // Lazy initialization - only access Nuxt composables when computed is accessed
  return computed(() => {
    // Client-side: Use window.location
    if (import.meta.client && typeof window !== 'undefined') {
      return window.location.origin
    }
    
    // Server-side: Try to get from headers
    if (import.meta.server) {
      try {
        // useRequestHeaders() is safer and handles context checking
        const headers = useRequestHeaders(['host', 'x-forwarded-host', 'x-forwarded-proto'])
        
        // Check for Nginx proxy headers first
        const protocol = headers['x-forwarded-proto'] || 'https'
        const host = headers['x-forwarded-host'] || 
                     headers['host'] || 
                     'goranee.ir'
        
        // Remove port if it's standard (80 for http, 443 for https)
        const hostWithoutPort = host.split(':')[0]
        const port = host.includes(':') ? host.split(':')[1] : null
        
        // Only include port if it's non-standard
        let baseUrl = `${protocol}://${hostWithoutPort}`
        if (port && port !== '80' && port !== '443') {
          baseUrl = `${protocol}://${hostWithoutPort}:${port}`
        }
        
        return baseUrl
      } catch (e) {
        // Headers not available in this context, will use fallback
      }
    }
    
    // Fallback: Try runtime config
    try {
      const config = useRuntimeConfig()
      const envBaseUrl = config.public.baseUrl as string | undefined
      if (envBaseUrl) {
        return envBaseUrl
      }
    } catch (e) {
      // Runtime config not available, use default
    }
    
    // Final fallback
    return 'https://goranee.ir'
  })
}

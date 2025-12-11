import { fileProvider } from '@modular-rest/client'

/**
 * Composable for building client-facing image URLs
 * These URLs are meant to be used in the browser, so they must use the public domain
 * (not internal Docker URLs like http://server:8081)
 */
export const useImageUrl = () => {
  // Get runtime config at composable initialization (valid Nuxt context)
  let ssrBaseUrl: string | undefined = undefined
  
  try {
    if (!process.client) {
      // Server-side (SSR): Use ssrApiBaseUrl from runtime config
      // This is set at build time via NUXT_SSR_API_BASE_URL build arg in Dockerfile
      const config = useRuntimeConfig()
      const configBaseUrl = config.public.ssrApiBaseUrl
      
      if (configBaseUrl && typeof configBaseUrl === 'string' && configBaseUrl.trim()) {
        ssrBaseUrl = configBaseUrl.trim().replace(/\/$/, '')
      }
    }
  } catch (e) {
    // Runtime config not available, will use fallback
  }
  
  // Fallback: Try reading from process.env (for development or if runtime config isn't set)
  if (!ssrBaseUrl && !process.client) {
    const envBaseUrl = process.env.NUXT_SSR_API_BASE_URL || process.env.VITE_SSR_API_BASE_URL
    if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim()) {
      ssrBaseUrl = envBaseUrl.trim().replace(/\/$/, '')
      console.warn('[useImageUrl] Using SSR base URL from process.env (fallback):', ssrBaseUrl)
    } else {
      console.error('[useImageUrl] NUXT_SSR_API_BASE_URL is not configured. Image URLs will use internal Docker URL which is not accessible to clients.')
    }
  }

  /**
   * Get a public-facing image URL for client-side use
   * During SSR, uses NUXT_SSR_API_BASE_URL to generate URLs accessible to browsers
   * On client, uses window.location.origin to generate URLs dynamically
   */
  const getImageUrl = (file: any): string | undefined => {
    if (!file) return undefined

    // Server-side: Use pre-fetched ssrBaseUrl
    // Client-side: baseUrl is undefined, so fileProvider will use GlobalOptions.host
    // which is set to window.location.origin + /api/ in the plugin
    const baseUrl = !process.client ? ssrBaseUrl : undefined

    return fileProvider.getFileLink(file, baseUrl)
  }

  return {
    getImageUrl,
  }
}

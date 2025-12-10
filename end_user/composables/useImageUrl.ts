import { fileProvider } from '@modular-rest/client'

/**
 * Composable for building client-facing image URLs
 * These URLs are meant to be used in the browser, so they must use the public domain
 * (not internal Docker URLs like http://server:8081)
 */
export const useImageUrl = () => {
  /**
   * Get a public-facing image URL for client-side use
   * During SSR, uses NUXT_SSR_API_BASE_URL to generate URLs accessible to browsers
   * On client, uses window.location.origin to generate URLs dynamically
   */
  const getImageUrl = (file: any): string | undefined => {
    if (!file) return undefined

    const config = useRuntimeConfig()
    let baseUrl: string | undefined = undefined

    if (!process.client) {
      // Server-side (SSR): Use ssrApiBaseUrl for public-facing URLs
      // This ensures image URLs are accessible to clients, not internal Docker URLs
      const ssrBaseUrl = config.public.ssrApiBaseUrl
      if (ssrBaseUrl && typeof ssrBaseUrl === 'string' && ssrBaseUrl.trim()) {
        baseUrl = ssrBaseUrl.trim().replace(/\/$/, '')
      } else {
        // NUXT_SSR_API_BASE_URL must be configured for production
        // Don't fall back to request URL as it may be internal Docker service name
        console.error('[useImageUrl] NUXT_SSR_API_BASE_URL is not configured. Image URLs will use internal Docker URL which is not accessible to clients. Please set NUXT_SSR_API_BASE_URL environment variable.')
        // baseUrl remains undefined, which will cause fileProvider to use GlobalOptions.host
        // This is incorrect for client-facing URLs but better than crashing
      }
    }
    // Client-side: baseUrl is undefined, so fileProvider will use GlobalOptions.host
    // which is set to window.location.origin + /api/ in the plugin

    return fileProvider.getFileLink(file, baseUrl)
  }

  return {
    getImageUrl,
  }
}

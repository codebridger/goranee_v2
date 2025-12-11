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

    let baseUrl: string | undefined = undefined

    if (!process.client) {
      // Server-side (SSR): Use ssrApiBaseUrl from runtime config
      // This is set at build time via NUXT_SSR_API_BASE_URL build arg in Dockerfile
      // The value is baked into the build, so it's available via runtime config
      const config = useRuntimeConfig()
      const ssrBaseUrl = config.public.ssrApiBaseUrl
      
      if (ssrBaseUrl && typeof ssrBaseUrl === 'string' && ssrBaseUrl.trim()) {
        baseUrl = ssrBaseUrl.trim().replace(/\/$/, '')
      } else {
        // Fallback: Try reading from process.env (for development or if runtime config isn't set)
        const envBaseUrl = process.env.NUXT_SSR_API_BASE_URL || process.env.VITE_SSR_API_BASE_URL
        if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.trim()) {
          baseUrl = envBaseUrl.trim().replace(/\/$/, '')
          console.warn('[useImageUrl] Using SSR base URL from process.env (fallback):', baseUrl)
        } else {
          console.error('[useImageUrl] NUXT_SSR_API_BASE_URL is not configured. Image URLs will use internal Docker URL which is not accessible to clients.')
        }
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

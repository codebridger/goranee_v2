import { computed, watch } from 'vue'
import { isRtlLanguage } from '~/composables/useI18nRtl'

/**
 * Universal plugin to set HTML dir attribute during SSR and client-side
 * This ensures the direction is correct from the initial render, preventing LTR flash
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Access i18n instance directly from nuxtApp to avoid injection issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const i18n = nuxtApp.$i18n as any
  
  if (!i18n || !i18n.locale) return

  const locale = i18n.locale
  
  // Get initial direction based on locale (default to 'farsi' = RTL)
  const getDirection = (loc: string): 'rtl' | 'ltr' => {
    return isRtlLanguage(loc) ? 'rtl' : 'ltr'
  }

  // Set initial direction using useHead (works in SSR and client)
  useHead({
    htmlAttrs: {
      dir: computed(() => getDirection(locale.value))
    }
  })

  // Watch for locale changes to ensure direction updates reactively
  watch(locale, (newLocale) => {
    // The useHead reactive value will automatically update, but we can also
    // manually update the DOM on client side for immediate feedback
    if (import.meta.client && typeof document !== 'undefined') {
      document.documentElement.dir = getDirection(newLocale as string)
    }
  }, { immediate: true })
})

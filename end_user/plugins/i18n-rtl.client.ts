import { computed, watch } from 'vue'
import { setDocumentDirection, isRtlLanguage } from '~/composables/useI18nRtl'

/**
 * Plugin to set initial document direction based on i18n locale
 * and add isRtl property to i18n instance
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Access i18n instance directly from nuxtApp to avoid injection issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const i18n = nuxtApp.$i18n as any
  
  if (!i18n || !i18n.locale) return

  const locale = i18n.locale
  
  // Set initial direction
  setDocumentDirection(locale.value)
  
  // Add isRtl computed property to i18n instance
  i18n.isRtl = computed(() => isRtlLanguage(locale.value))
  
  // Watch for locale changes
  watch(locale, (newLocale) => {
    setDocumentDirection(newLocale as string)
  })
})


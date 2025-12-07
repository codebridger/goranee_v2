import type { UILanguageOption } from '~/stores/contentLanguage'

// Export UILanguageOption as MessageLanguages for backward compatibility
export type MessageLanguages = UILanguageOption

// RTL language configuration - using UILanguageOption values
export const rtlLanguages: UILanguageOption[] = ['farsi', 'sorani-farsi']

export const isRtlLanguage = (locale: string): boolean => {
  return rtlLanguages.includes(locale as UILanguageOption)
}

// Set document direction based on locale
export const setDocumentDirection = (locale: string) => {
  if (import.meta.client && typeof document !== 'undefined') {
    document.documentElement.dir = isRtlLanguage(locale) ? 'rtl' : 'ltr'
  }
}

/**
 * Composable for i18n with RTL support
 */
export const useI18nRtl = () => {
  const { locale, setLocale } = useI18n()

  // Watch for locale changes and update document direction
  watch(locale, (newLocale) => {
    setDocumentDirection(newLocale)
  }, { immediate: true })

  return {
    locale,
    setLocale,
    isRtl: computed(() => isRtlLanguage(locale.value)),
    setDocumentDirection,
  }
}



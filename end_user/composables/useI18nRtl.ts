export type MessageLanguages = 'en' | 'fa'

// RTL language configuration
export const rtlLanguages: MessageLanguages[] = ['fa']

export const isRtlLanguage = (locale: string): boolean => {
  return rtlLanguages.includes(locale as MessageLanguages)
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



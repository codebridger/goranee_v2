import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import fa from '../locales/fa.json'

export type MessageLanguages = 'en' | 'fa'

export const defaultLocale: MessageLanguages = 'en'

// RTL language configuration
export const rtlLanguages: MessageLanguages[] = ['fa']

export const isRtlLanguage = (locale: MessageLanguages): boolean => {
  return rtlLanguages.includes(locale)
}

// Set document direction based on locale
export const setDocumentDirection = (locale: MessageLanguages) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = isRtlLanguage(locale) ? 'rtl' : 'ltr'
  }
}

const i18n = createI18n<[typeof en, typeof fa], MessageLanguages>({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en,
    fa,
  },
})

// Set initial direction based on default locale
setDocumentDirection(defaultLocale)

export default i18n
export { i18n }

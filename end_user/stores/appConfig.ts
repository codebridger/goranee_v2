import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { setDocumentDirection } from '~/composables/useI18nRtl'
import type { UILanguageOption } from '~/stores/contentLanguage'

export const useAppConfigStore = defineStore('appConfig', () => {
  const { locale, setLocale } = useI18n()

  // Theme state
  const getInitialTheme = (): boolean => {
    // Check localStorage first (client-side only)
    if (import.meta.client) {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') {
        return stored === 'dark'
      }
      // Fallback to system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
    }
    return false
  }
  const isDark = ref<boolean>(getInitialTheme())

  // Language state (synced with i18n)
  const getInitialLanguage = (): UILanguageOption => {
    if (import.meta.client) {
      const stored = localStorage.getItem('language') as UILanguageOption
      const validOptions: UILanguageOption[] = ['sorani-latin', 'sorani-farsi', 'farsi', 'english', 'kmr']
      if (stored && validOptions.includes(stored)) {
        return stored
      }
      // If no stored value, use i18n's current locale
      if (locale.value && validOptions.includes(locale.value as UILanguageOption)) {
        return locale.value as UILanguageOption
      }
    }
    // Fallback to 'farsi' to match i18n defaultLocale in nuxt.config.ts
    return 'farsi'
  }
  const currentLanguage = ref<UILanguageOption>(getInitialLanguage())

  // Computed direction based on language
  const currentDirection = computed(() => {
    return (currentLanguage.value === 'farsi' || currentLanguage.value === 'sorani-farsi') ? 'RTL' : 'LTR'
  })

  // Initialize theme on store creation
  const initializeTheme = () => {
    if (import.meta.client && typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (import.meta.client && typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  // Set theme explicitly
  const setTheme = (dark: boolean) => {
    isDark.value = dark
    if (import.meta.client && typeof document !== 'undefined') {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
  }

  // Switch language
  const switchLanguage = (langCode: UILanguageOption) => {
    currentLanguage.value = langCode
    setLocale(langCode)
    setDocumentDirection(langCode)
    if (import.meta.client) {
      localStorage.setItem('language', langCode)
    }
  }

  // Sync i18n locale with store
  watch(
    () => locale.value,
    (newLocale) => {
      if (newLocale !== currentLanguage.value) {
        const validOptions: UILanguageOption[] = ['sorani-latin', 'sorani-farsi', 'farsi', 'english', 'kmr']
        if (validOptions.includes(newLocale as UILanguageOption)) {
          currentLanguage.value = newLocale as UILanguageOption
          setDocumentDirection(newLocale)
        }
      }
    },
  )

  // Initialize on store creation (client-side only)
  if (import.meta.client) {
    initializeTheme()
    if (currentLanguage.value !== locale.value) {
      setLocale(currentLanguage.value)
      setDocumentDirection(currentLanguage.value)
    }
  }

  return {
    isDark,
    currentLanguage,
    currentDirection,
    toggleTheme,
    setTheme,
    switchLanguage,
    initializeTheme,
  }
})

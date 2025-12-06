import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { setDocumentDirection, type MessageLanguages } from '~/composables/useI18nRtl'

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
  const getInitialLanguage = (): MessageLanguages => {
    if (import.meta.client) {
      const stored = localStorage.getItem('language') as MessageLanguages
      if (stored && (stored === 'en' || stored === 'fa')) {
        return stored
      }
      // If no stored value, use i18n's current locale (which should be the defaultLocale 'fa')
      if (locale.value && (locale.value === 'en' || locale.value === 'fa')) {
        return locale.value as MessageLanguages
      }
    }
    // Fallback to 'fa' to match i18n defaultLocale in nuxt.config.ts
    return 'fa'
  }
  const currentLanguage = ref<MessageLanguages>(getInitialLanguage())

  // Computed direction based on language
  const currentDirection = computed(() => {
    return currentLanguage.value === 'fa' ? 'RTL' : 'LTR'
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
  const switchLanguage = (langCode: MessageLanguages) => {
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
        currentLanguage.value = newLocale as MessageLanguages
        setDocumentDirection(newLocale)
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

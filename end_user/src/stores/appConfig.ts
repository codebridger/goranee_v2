import { ref, computed, watch, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '../i18n'
import { setDocumentDirection, type MessageLanguages } from '../i18n'

export const useAppConfigStore = defineStore('appConfig', () => {
  // Access i18n locale directly from the i18n instance
  // In composition API mode, locale is a Ref, but TypeScript types may not reflect this
  const locale = i18n.global.locale as unknown as Ref<MessageLanguages>

  // Theme state
  const getInitialTheme = (): boolean => {
    // Check localStorage first
    const stored = localStorage.getItem('theme')
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark'
    }
    // Fallback to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }
  const isDark = ref<boolean>(getInitialTheme())

  // Language state (synced with i18n)
  const getInitialLanguage = (): MessageLanguages => {
    const stored = localStorage.getItem('language') as MessageLanguages
    if (stored && (stored === 'en' || stored === 'fa')) {
      return stored
    }
    return 'en'
  }
  const currentLanguage = ref<MessageLanguages>(getInitialLanguage())

  // Computed direction based on language
  const currentDirection = computed(() => {
    return currentLanguage.value === 'fa' ? 'RTL' : 'LTR'
  })

  // Initialize theme on store creation
  const initializeTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // Set theme explicitly
  const setTheme = (dark: boolean) => {
    isDark.value = dark
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  // Switch language
  const switchLanguage = (langCode: MessageLanguages) => {
    currentLanguage.value = langCode
    locale.value = langCode
    setDocumentDirection(langCode)
    localStorage.setItem('language', langCode)
  }

  // Sync i18n locale with store
  watch(
    () => locale.value,
    (newLocale) => {
      if (newLocale !== currentLanguage.value) {
        currentLanguage.value = newLocale as MessageLanguages
        setDocumentDirection(newLocale as MessageLanguages)
      }
    },
  )

  // Initialize on store creation
  initializeTheme()
  if (currentLanguage.value !== locale.value) {
    locale.value = currentLanguage.value
    setDocumentDirection(currentLanguage.value)
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

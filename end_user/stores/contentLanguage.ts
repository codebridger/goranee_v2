import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setDocumentDirection } from '~/composables/useI18nRtl'
import type { LanguageCode } from '~/constants/routes'
import { ROUTES } from '~/constants/routes'

// UI Language options for the switcher
export type UILanguageOption = 'sorani-latin' | 'sorani-farsi' | 'farsi' | 'english' | 'kmr'

// Content language code (excludes 'en' as it's not used in content objects)
export type ContentLanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr' | 'hac'

// Map UI language option to UI locale and content language
interface LanguageMapping {
  uiLocale: 'farsi' | 'english' | 'sorani-latin' | 'sorani-farsi' | 'kmr'
  contentLang: LanguageCode
}

const getLanguageMapping = (uiLang: UILanguageOption): LanguageMapping => {
  switch (uiLang) {
    case 'farsi':
      return { uiLocale: 'farsi', contentLang: 'ckb-IR' } // Farsi UI, Sorani-Farsi content
    case 'english':
      return { uiLocale: 'english', contentLang: 'ckb-Latn' } // English UI, Sorani-Latin content
    case 'sorani-latin':
      return { uiLocale: 'sorani-latin', contentLang: 'ckb-Latn' } // Sorani-Latin UI, Sorani-Latin content
    case 'sorani-farsi':
      return { uiLocale: 'sorani-farsi', contentLang: 'ckb-IR' } // Sorani-Farsi UI, Sorani-Farsi content
    case 'kmr':
      return { uiLocale: 'kmr', contentLang: 'kmr' } // Kurmanji UI, Kurmanji content
    default:
      return { uiLocale: 'farsi', contentLang: 'ckb-IR' } // Default fallback
  }
}

// Get UI language option from content language (for initialization)
const getUILanguageFromContent = (contentLang: LanguageCode): UILanguageOption => {
  switch (contentLang) {
    case 'ckb-Latn':
      return 'sorani-latin'
    case 'ckb-IR':
      return 'sorani-farsi'
    case 'en':
      return 'english'
    case 'kmr':
      return 'kmr'
    default:
      return 'farsi' // Default fallback
  }
}

export const useContentLanguageStore = defineStore('contentLanguage', () => {
  const route = useRoute()
  const router = useRouter()
  const { locale, setLocale } = useI18n()

  // Get initial UI language from localStorage or default to 'farsi'
  const getInitialUILanguage = (): UILanguageOption => {
    if (import.meta.client) {
      const stored = localStorage.getItem('uiLanguage') as UILanguageOption
      const validOptions: UILanguageOption[] = ['sorani-latin', 'sorani-farsi', 'farsi', 'english', 'kmr']
      if (stored && validOptions.includes(stored)) {
        return stored
      }
    }
    return 'farsi' // Default fallback
  }

  const currentUILanguage = ref<UILanguageOption>(getInitialUILanguage())

  // Get current content language based on UI language
  const getContentLanguage = computed<ContentLanguageCode>(() => {
    const mapping = getLanguageMapping(currentUILanguage.value)
    // Content language is always a Kurdish variant, never 'en'
    return mapping.contentLang as ContentLanguageCode
  })

  // Get current UI locale
  const getUILocale = computed(() => {
    const mapping = getLanguageMapping(currentUILanguage.value)
    return mapping.uiLocale
  })

  // Get current direction (RTL or LTR)
  const getCurrentDirection = computed<'RTL' | 'LTR'>(() => {
    // sorani-farsi and farsi are RTL
    if (currentUILanguage.value === 'sorani-farsi' || currentUILanguage.value === 'farsi') {
      return 'RTL'
    }
    // sorani-latin, english, and kmr are LTR
    return 'LTR'
  })

  // Check if current language is RTL
  const isRtl = computed(() => {
    return getCurrentDirection.value === 'RTL'
  })

  // Set UI language (which determines both UI locale and content language)
  const setUILanguage = (uiLang: UILanguageOption) => {
    const validOptions: UILanguageOption[] = ['sorani-latin', 'sorani-farsi', 'farsi', 'english', 'kmr']
    if (!validOptions.includes(uiLang)) {
      console.warn(`Invalid UI language option: ${uiLang}. Defaulting to farsi.`)
      uiLang = 'farsi'
    }

    currentUILanguage.value = uiLang

    if (import.meta.client) {
      localStorage.setItem('uiLanguage', uiLang)
    }

    // Get mapping for UI locale and content language
    const mapping = getLanguageMapping(uiLang)

    // Update i18n locale (this will trigger the i18n plugin to set direction)
    if (locale.value !== mapping.uiLocale) {
      setLocale(mapping.uiLocale)
      // Also set direction explicitly to ensure it's set immediately
      setDocumentDirection(mapping.uiLocale)
    } else {
      // If locale hasn't changed, still update direction in case it's out of sync
      setDocumentDirection(mapping.uiLocale)
    }

    // Update route if we're on a page with lang parameter
    updateRouteIfNeeded(mapping.contentLang)
  }

  // Legacy method for backward compatibility (maps to UI language)
  const setContentLanguage = (lang: LanguageCode) => {
    const uiLang = getUILanguageFromContent(lang)
    setUILanguage(uiLang)
  }

  // Update route if we're on a page that supports language parameter
  const updateRouteIfNeeded = (lang: LanguageCode) => {
    if (!import.meta.client) return

    const path = route.path
    const params = route.params

    // Check if we're on a tab page with lang parameter
    const tabMatch = path.match(/^\/tab\/([^/]+)(?:\/([^/]+))?$/)
    if (tabMatch && tabMatch[1]) {
      const songId = tabMatch[1]
      const newPath = lang === 'ckb-IR'
        ? ROUTES.TAB.DETAIL(songId) // Default: no lang in URL
        : ROUTES.TAB.DETAIL(songId, lang)
      if (newPath !== path) {
        router.push(newPath)
      }
      return
    }

    // Check if we're on an artist page with lang parameter
    const artistMatch = path.match(/^\/artist\/([^/]+)(?:\/([^/]+))?$/)
    if (artistMatch && artistMatch[1]) {
      const artistId = artistMatch[1]
      const newPath = lang === 'ckb-IR'
        ? ROUTES.ARTIST.DETAIL(artistId) // Default: no lang in URL
        : ROUTES.ARTIST.DETAIL(artistId, lang)
      if (newPath !== path) {
        router.push(newPath)
      }
      return
    }
  }

  // Sync with route params when on pages with lang parameter
  const syncWithRoute = () => {
    if (!import.meta.client) return

    const langParam = route.params.lang
    if (langParam) {
      const langStr = Array.isArray(langParam) ? langParam[0] : langParam
      const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac', 'en']
      if (validLangs.includes(langStr as LanguageCode)) {
        const routeLang = langStr as LanguageCode
        const uiLang = getUILanguageFromContent(routeLang)
        
        // Only update if different to avoid infinite loops
        if (currentUILanguage.value !== uiLang) {
          const mapping = getLanguageMapping(uiLang)
          currentUILanguage.value = uiLang
          if (import.meta.client) {
            localStorage.setItem('uiLanguage', uiLang)
          }
          // Update i18n locale (this will trigger the i18n plugin to set direction)
          if (locale.value !== mapping.uiLocale) {
            setLocale(mapping.uiLocale)
            // Also set direction explicitly to ensure it's set immediately
            setDocumentDirection(mapping.uiLocale)
          } else {
            // If locale hasn't changed, still update direction in case it's out of sync
            setDocumentDirection(mapping.uiLocale)
          }
        }
      }
    }
  }

  // Watch route changes to sync language
  watch(
    () => route.params.lang,
    () => {
      syncWithRoute()
    },
    { immediate: true }
  )

  // Watch UI language changes to update document direction
  watch(
    () => currentUILanguage.value,
    (newLang) => {
      if (import.meta.client) {
        const mapping = getLanguageMapping(newLang)
        setDocumentDirection(mapping.uiLocale)
      }
    },
    { immediate: true }
  )

  // Initialize: sync with route on mount and set i18n locale and direction
  if (import.meta.client) {
    syncWithRoute()
    // Ensure i18n locale matches current UI language
    const mapping = getLanguageMapping(currentUILanguage.value)
    if (locale.value !== mapping.uiLocale) {
      setLocale(mapping.uiLocale)
      // Also set direction explicitly to ensure it's set immediately
      setDocumentDirection(mapping.uiLocale)
    } else {
      // If locale hasn't changed, still update direction in case it's out of sync
      setDocumentDirection(mapping.uiLocale)
    }
  }

  return {
    currentLanguage: getContentLanguage, // For backward compatibility
    currentUILanguage: computed(() => currentUILanguage.value),
    currentUILocale: getUILocale,
    currentDirection: getCurrentDirection,
    isRtl,
    setUILanguage,
    setContentLanguage, // Legacy method
    syncWithRoute,
  }
})


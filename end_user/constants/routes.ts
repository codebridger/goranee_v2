/**
 * Centralized route path constants
 * Use these constants instead of hardcoded route paths throughout the application
 */

export type LanguageCode = 'ckb-IR' | 'ckb-Latn' | 'kmr' | 'hac' | 'en'

export const ROUTES = {
  HOME: '/',
  DISCOVERY: '/discovery',
  COMMUNITY: '/community',
  LOGIN: '/login',
  UPLOAD: '/upload',
  
  ARTIST: {
    INDEX: '/artist',
    DETAIL: (id: string, lang?: LanguageCode) => 
      lang ? `/artist/${id}/${lang}` : `/artist/${id}`,
  },
  
  TAB: {
    DETAIL: (id: string, lang?: LanguageCode) => 
      lang ? `/tab/${id}/${lang}` : `/tab/${id}`,
  },
  
  LEGAL: {
    PRIVACY: '/legal/privacy',
    TERMS: '/legal/terms',
    DMCA: '/legal/dmca',
  },
} as const


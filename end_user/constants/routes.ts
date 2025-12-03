/**
 * Centralized route path constants
 * Use these constants instead of hardcoded route paths throughout the application
 */

export const ROUTES = {
  HOME: '/',
  DISCOVERY: '/discovery',
  COMMUNITY: '/community',
  LOGIN: '/login',
  UPLOAD: '/upload',
  
  ARTIST: {
    INDEX: '/artist',
    DETAIL: (id: string) => `/artist/${id}`,
  },
  
  TAB: {
    DETAIL: (id: string) => `/tab/${id}`,
  },
  
  LEGAL: {
    PRIVACY: '/legal/privacy',
    TERMS: '/legal/terms',
    DMCA: '/legal/dmca',
  },
} as const


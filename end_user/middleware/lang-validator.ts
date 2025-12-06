import type { LanguageCode } from '~/constants/routes'

export default defineNuxtRouteMiddleware((to) => {
  const validLangs: LanguageCode[] = ['ckb-IR', 'ckb-Latn', 'kmr', 'hac']
  const lang = to.params.lang as string | string[]
  
  // Handle array case (catch-all route)
  const langStr = Array.isArray(lang) ? lang[0] : lang
  
  // If lang param exists but is invalid, redirect to default (remove lang from path)
  if (langStr && !validLangs.includes(langStr as LanguageCode)) {
    const pathWithoutLang = to.path.replace(`/${langStr}`, '')
    return navigateTo(pathWithoutLang)
  }
})


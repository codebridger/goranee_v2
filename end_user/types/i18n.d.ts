import type { ComputedRef } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $i18n: {
      locale: ComputedRef<string>
      isRtl: ComputedRef<boolean>
      [key: string]: any
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: {
      locale: ComputedRef<string>
      isRtl: ComputedRef<boolean>
      [key: string]: any
    }
  }
}

export {}


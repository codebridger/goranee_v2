// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Server configuration
  nitro: {
    // @ts-ignore
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    host: '0.0.0.0',
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
  ],

  // Runtime config for environment variables
  runtimeConfig: {
    // Private keys (only available on server-side)
    // Public keys (exposed to client-side)
    public: {
      // @ts-ignore
      apiBaseUrl: process.env.NUXT_API_BASE_URL || process.env.VITE_API_BASE_URL || '/api/',
      // @ts-ignore
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'https://goranee.ir',
      // @ts-ignore
      ssrApiBaseUrl: process.env.NUXT_SSR_API_BASE_URL || process.env.VITE_SSR_API_BASE_URL || 'https://goranee.ir/api',
    },
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'farsi',
        iso: 'fa-IR',
        file: 'farsi.json',
      },
      {
        code: 'english',
        iso: 'en-US',
        file: 'english.json',
      },
      {
        code: 'sorani-latin',
        iso: 'en-US',
        file: 'sorani-latin.json',
      },
      {
        code: 'sorani-farsi',
        iso: 'fa-IR',
        file: 'sorani-farsi.json',
      },
      {
        code: 'kmr',
        iso: 'ku-TR',
        file: 'kmr.json',
      },
    ],
    langDir: 'locales',
    defaultLocale: 'farsi',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },

  // CSS configuration
  // css: ['~/assets/css/main.css'],

  // TypeScript configuration
  typescript: {
    strict: true,
  },

  // PostCSS configuration
  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  // Component configuration
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // App configuration
  app: {
    head: {
      title: 'Goranee - Kurdish Chords Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
})

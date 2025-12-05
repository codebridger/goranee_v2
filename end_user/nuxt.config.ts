// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Server configuration
  nitro: {
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
      apiBaseUrl: process.env.NUXT_API_BASE_URL || process.env.VITE_API_BASE_URL || '/api/',
    },
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
      },
      {
        code: 'fa',
        iso: 'fa-IR',
        file: 'fa.json',
      },
    ],
    langDir: 'locales',
    defaultLocale: 'fa',
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

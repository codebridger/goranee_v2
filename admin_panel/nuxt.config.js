const dotenv = require("dotenv");
dotenv.config({
  path: require("path").join(__dirname, "../.env")
});

export default {
  env: {
    // base url for client side to be used in axios
    BASE_URL: process.env.VUE_APP_BASE_URL,
    // base url for server side to be used in axios
    BASE_URL_ON_SERVER: process.env.VUE_APP_BASE_URL_ON_SERVER
  },

  server: {
    // host: '0'
  },

  // Disable SSR - client-side only rendering
  ssr: false,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "آکورد گورانی کوردی",
    meta: [
      {
        charset: "utf-8"
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        hid: "default",
        name: "description",
        content: "آرشیو آکورد آهنگ های کوردی"
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico"
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  // Include Tailwind CSS explicitly for static generation with ssr: false
  css: ["vuesax/dist/vuesax.css", "~/assets/css/tailwind.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "@/plugins/vuesax",
    {
      src: "@plugins/toaster.js",
      mode: "client"
    },
    {
      src: "@plugins/boot.ts",
      mode: "client"
    },
    {
      src: "@plugins/croppa.js",
      mode: "client"
    }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    "~/components",
    {
      path: "~/components/administration",
      prefix: ""
    },
    {
      path: "~/components/database",
      prefix: ""
    },
    {
      path: "~/components/inputs",
      prefix: ""
    },
    {
      path: "~/components/layouts",
      prefix: ""
    },
    {
      path: "~/components/materials",
      prefix: ""
    },
    {
      path: "~/components/notifiers",
      prefix: ""
    }
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    "@nuxtjs/tailwindcss"
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    "@nuxtjs/pwa",

    "@nuxtjs/google-gtag",

    [
      "nuxt-i18n",
      {
        locales: [
          {
            code: "fa",
            iso: "fa-IR",
            file: "fa-IR.js"
          }
        ],
        lazy: true,
        langDir: "lang/",
        defaultLocale: "fa"
      }
    ]
  ],

  router: {
    base: "/admin",
    middleware: ["init"]
  },

  // TailwindCSS module configuration
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.js",
    exposeConfig: false,
    injectPosition: 0, // Inject Tailwind CSS first (0 = first position)
    viewer: true
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: "en"
    }
  },

  "google-gtag": {
    id: process.env.VUE_APP_GA_MEASUREMENT_ID || "G-Q79P6JJ50S",
    config: {
      // this are the config options for `gtag
      // check out official docs: https://developers.google.com/analytics/devguides/collection/gtagjs/
      anonymize_ip: true, // anonymize IP
      send_page_view: true, // might be necessary to avoid duplicated page track on page reload
      linker: {
        domains: ["goranee.ir", "localhost"]
      }
    },
    debug: true, // enable to track in dev mode
    disableAutoPageTrack: false // disable if you don't want to track each page route with router.afterEach(...)
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      preset: {
        stage: 1
      },
      // Tailwind CSS and autoprefixer are automatically added by @nuxtjs/tailwindcss module
      plugins: {
        autoprefixer: {}
      }
    },
    // Optimize build performance
    parallel: process.env.NODE_ENV === "production",
    cache: true,
    hardSource: false,
    // Configure loaders - disable fibers for better Docker compatibility
    loaders: {
      sass: {
        sassOptions: {
          outputStyle: "compressed",
          fiber: false // Disable fibers to avoid native module compilation issues
        }
      },
      scss: {
        sassOptions: {
          outputStyle: "compressed",
          fiber: false
        }
      }
    },
    // Extend webpack configuration
    extend(config, { isDev, isClient }) {
      // Increase webpack performance hints threshold to avoid warnings
      if (!isDev) {
        config.performance = {
          hints: "warning",
          maxEntrypointSize: 512000,
          maxAssetSize: 512000
        };
      }
      // Optimize module resolution
      config.resolve.symlinks = false;
      // Add better error handling
      config.stats = {
        errorDetails: true,
        warnings: false
      };
    }
  },

  buildDir: "../.nuxt",

  // Target: static for static site generation
  // Set NUXT_TARGET=static in Docker build environment
  // Defaults to "static" for static HTML generation (no SSR server required)
  target: process.env.NUXT_TARGET || "static",

  // Generate configuration for static site generation
  generate: {
    // Use fallback mode for dynamic routes (SPA fallback)
    // This prevents hanging on dynamic routes like /admin/artist/_id, /tab/_id, etc.
    fallback: true,
    // Disable crawler to speed up generation and prevent hanging
    crawler: false
  }
};

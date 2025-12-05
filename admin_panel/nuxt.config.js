const dotenv = require("dotenv");
dotenv.config({
  path: require("path").join(__dirname, "../.env"),
});

export default {
  env: {
    // base url for client side to be used in axios
    BASE_URL: process.env.VUE_APP_BASE_URL,
    // base url for server side to be used in axios
    BASE_URL_ON_SERVER: process.env.VUE_APP_BASE_URL_ON_SERVER,
  },

  server: {
    // host: '0'
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "آکورد گورانی کوردی",
    meta: [
      {
        charset: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        hid: "default",
        name: "description",
        content: "آرشیو آکورد آهنگ های کوردی",
      },
    ],
    link: [
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["vuesax/dist/vuesax.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    "@/plugins/vuesax",
    {
      src: "@plugins/toaster.js",
      mode: "client",
    },
    {
      src: "@plugins/boot.ts",
      mode: "client",
    },
    {
      src: "@plugins/croppa.js",
      mode: "client",
    },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: [
    "~/components",
    {
      path: "~/components/administration",
      prefix: "",
    },
    {
      path: "~/components/database",
      prefix: "",
    },
    {
      path: "~/components/inputs",
      prefix: "",
    },
    {
      path: "~/components/layouts",
      prefix: "",
    },
    {
      path: "~/components/materials",
      prefix: "",
    },
    {
      path: "~/components/notifiers",
      prefix: "",
    },
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
    "@nuxtjs/tailwindcss",
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
            file: "fa-IR.js",
          },
        ],
        lazy: true,
        langDir: "lang/",
        defaultLocale: "fa",
      },
    ],
  ],

  router: {
    middleware: ["init"],
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: "en",
    },
  },

  "google-gtag": {
    id: process.env.VUE_APP_GA_MEASUREMENT_ID || "G-Q79P6JJ50S",
    config: {
      // this are the config options for `gtag
      // check out official docs: https://developers.google.com/analytics/devguides/collection/gtagjs/
      anonymize_ip: true, // anonymize IP
      send_page_view: true, // might be necessary to avoid duplicated page track on page reload
      linker: {
        domains: ["goranee.ir", "localhost"],
      },
    },
    debug: true, // enable to track in dev mode
    disableAutoPageTrack: false, // disable if you don't want to track each page route with router.afterEach(...)
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  buildDir: "../.nuxt",
};

const path = require("path");

/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  content: [
    path.join(__dirname, "./components/**/*.{js,vue,ts}"),
    path.join(__dirname, "./layouts/**/*.vue"),
    path.join(__dirname, "./pages/**/*.vue"),
    path.join(__dirname, "./plugins/**/*.{js,ts}"),
    path.join(__dirname, "./nuxt.config.{js,ts}"),
    path.join(__dirname, "./app.vue")
  ],
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: []
};

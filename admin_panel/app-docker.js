const { loadNuxt, build } = require("nuxt");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = require("express")();

const isDev = process.env.NODE_ENV !== "production";

async function start() {
  // We get Nuxt instance
  //
  const nuxt = await loadNuxt(isDev ? "dev" : "start");

  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      pathRewrite: (path, req) => path.replace("/api", ""),
    })
  );

  // Render every route with Nuxt.js
  //
  app.use(nuxt.render);

  // Build only in dev mode with hot-reloading
  //
  if (isDev) {
    build(nuxt);
  }

  app.listen(8080);
}

start();

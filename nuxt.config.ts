// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      charset: "utf-16",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      script: [
        { src: "https://aframe.io/releases/1.0.4/aframe.min.js" },
        {
          src: "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js",
        },
      ],
    },
  },
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  modules: ["nuxt-icon"],
  icon: {
    customCollections: [
      {
        prefix: "moledor",
        dir: "./assets/icon",
      },
    ],
  },
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI,
  },
  nitro: {
    plugins: ["~/server/index.ts", "~/server/plugins/socket.io.ts"],
    experimental: {
      websocket: true,
    },
  },
  routeRules: {
    "/xxo/**": { ssr: false },
  },
  vue: {
    config: {
      ignoredElements: ["a-scene", "a-camera", "a-box", "a-entity"],
    },
  },
  compatibilityDate: "2024-08-09",
});

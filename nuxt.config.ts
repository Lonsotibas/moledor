// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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
  compatibilityDate: "2024-08-09",
});

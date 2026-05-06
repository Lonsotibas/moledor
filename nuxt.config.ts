// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1, maximum-scale=1",
      script: [
        { src: "/js/aframe.min.js" },
        { src: "/js/aframe-ar.js" },
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
    compilerOptions: {
      // Tell Vue 3 to leave A-Frame custom elements alone
      isCustomElement: (tag) => tag.startsWith("a-"),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  compatibilityDate: "2024-08-09",
});

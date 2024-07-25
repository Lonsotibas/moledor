// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  modules: ['nuxt-icon', "nuxt-server-utils"],
  icon: {
    customCollections: [
      {
        prefix: 'moledor',
        dir: './assets/icon'
      },
    ],
  },
})

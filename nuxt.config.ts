import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Progress is stored in the browser, so render on the client only.
  ssr: false,

  app: {
    head: {
      title: 'Mainframe',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap' },
      ],
    },
  },

  modules: ['vuetify-nuxt-module'],

  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  vuetify: {
    vuetifyOptions: {
      icons: { defaultSet: 'mdi' },
      theme: {
        defaultTheme: 'mainframe',
        themes: {
          mainframe: {
            dark: false,
            colors: {
              primary: '#F2B807',
              'on-primary': '#1F1A0A',
              'primary-darken-1': '#8A6500',
              secondary: '#2F6FB5',
              'on-secondary': '#FFFFFF',
              background: '#FFFBEF',
              surface: '#FFFFFF',
              error: '#B3261E',
              success: '#2E7D4F',
            },
          },
        },
      },
      defaults: {
        VBtn: { rounded: 'pill' },
        VCard: { variant: 'flat', border: true, rounded: 'lg' },
      },
    },
  },
})

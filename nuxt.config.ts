// // https://nuxt.com/docs/api/configuration/nuxt-config
// export default defineNuxtConfig({
//   modules: ['vuetify-nuxt-module'],
//   compatibilityDate: '2025-07-15',
//   devtools: { enabled: true }
// })

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SPA mode (as the README says): progress lives in localStorage, so there is nothing
  // to render on a server. This also fixes the hydration warnings and lets every page
  // load directly on GitHub Pages.
  ssr: false,

  app: {
    // For GitHub Pages run: NUXT_APP_BASE_URL=/COS212-learning-App/ npm run generate
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'MainFrame',
      meta: [{ name: 'description', content: 'A pre-lecture tutor for binary search trees and traversals (COS 212).' }],
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
              primary: '#F2B807',            // yellow: app bar, main buttons, current node
              'on-primary': '#1F1A0A',       // dark text on yellow
              'primary-darken-1': '#8A6500', // deep gold: links, text, icons on white
              secondary: '#2F6FB5',          // blue: queue / stack highlight
              'on-secondary': '#FFFFFF',
              background: '#FFFBEF',         // warm off-white page
              surface: '#FFFFFF',
              error: '#B3261E',
              success: '#2E7D4F',
            },
          },
        },
      },
      defaults: {
        VBtn: { rounded: 'pill' },
        VCard: { variant: 'outlined', rounded: 'lg' },
      },
    },
  },
})

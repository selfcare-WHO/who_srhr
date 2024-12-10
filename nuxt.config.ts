import { fileURLToPath } from 'node:url'
import { createRequire } from 'module'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-14',

  ssr: false,

  runtimeConfig: {
    public: {
      comparisonFeatureActive: process.env.COMPARISON_FEATURE_ACTIVE === 'true'
    }
  },

  app: {
    head: {
      title: 'SRHR Country Profile',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: `World Health Organization
            Sexual and Reproductive Health and Rights
            Country Profiles
          `
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
    }
  },

  alias: {
    '@assets': fileURLToPath(new URL('./assets', import.meta.url)),
    '@components': fileURLToPath(new URL('./components', import.meta.url)),
    '@composables': fileURLToPath(new URL('./composables', import.meta.url)),
    '@store': fileURLToPath(new URL('./store', import.meta.url)),
    '@css': fileURLToPath(new URL('./assets/css', import.meta.url)),
    '@server': fileURLToPath(new URL('./server', import.meta.url)),
    '@lib': fileURLToPath(new URL('./lib', import.meta.url)),
    '@utils': fileURLToPath(new URL('./utils', import.meta.url)),
    '@enums': fileURLToPath(new URL('./types/enums.ts', import.meta.url))
  },

  css: ['~/assets/scss/index.scss'],

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@element-plus/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/fonts',
    'nuxt-svgo'
  ],

  fonts: {
    adobe: {
      id: ['zpe4zmg']
    },

    families: [
      {
        name: 'Source Sans Pro',
        provider: 'adobe',
        weights: [400, 500, 600, 700]
      },
      {
        name: 'Roboto',
        provider: 'google',
        weights: [400, 500, 600, 700]
      }
    ]
  },

  tailwindcss: {
    cssPath: './assets/css/tailwind.css',
    exposeConfig: true
  },

  vueuse: {
    ssrHandlers: true
  },

  vite: {
    optimizeDeps: {
      include: ['tailwind.config.js']
    },

    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "@/assets/scss/element_plus.scss" as element;`,
          quietDeps: true
        }
      }
    }
  },

  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss'
  }
})

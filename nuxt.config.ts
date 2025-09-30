import { fileURLToPath } from 'node:url'

declare module '*.svg?raw' {
  const content: string
}

export default defineNuxtConfig({
  compatibilityDate: '2024-11-14',

  devtools: {
    enabled: true
  },

  ssr: false,

  runtimeConfig: {
    public: {
      comparisonFeatureActive: process.env.COMPARISON_FEATURE_ACTIVE === 'true'
    }
  },

  gtag: {
    enabled: process.env.NODE_ENV === 'production'
  },

  app: {
    keepalive: true,
    head: {
      title: 'SRHR Country Profile',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: `World Health Organization
            Sexual and Reproductive Health and Rights
            Country Profiles
          `
        }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      script: [
        {
          type: 'module',
          src: 'https://public.tableau.com/javascripts/api/tableau.embedding.3.2.0.min.js'
        }
      ]
    }
  },

  routeRules: {
    '/country-comparison': {
      redirect: '/country-comparison/map-view'
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
    'nuxt-svgo',
    'nuxt-gtag',
    'nuxt-mapbox'
  ],

  fonts: {
    families: [
      {
        name: 'Source Sans 3',
        provider: 'google',
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
          // @ts-ignore - api option is valid but not in current types
          api: 'modern-compiler',

          additionalData: `@use "@/assets/scss/element_plus.scss" as element;`,
          quietDeps: true
        }
      }
    }
  },

  mapbox: {
    accessToken: process.env.VITE_MAPBOX_PUBLIC_KEY,
    prewarm: true,
    persistent: false
  },

  elementPlus: {
    icon: 'ElIcon',
    importStyle: 'scss'
  },

  vue: {
    compilerOptions: {
      isCustomElement: tag => ['tableau-viz', 'iframe-style'].includes(tag)
    }
  }
})

import { fileURLToPath } from 'node:url'

declare module '*.svg?raw' {
  const content: string
}

const mapViewActive = process.env.MAP_VIEW_ACTIVE === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-14',

  devtools: {
    enabled: false
  },

  ssr: false,

  runtimeConfig: {
    public: {
      comparisonFeatureActive: process.env.COMPARISON_FEATURE_ACTIVE === 'true',
      mapViewActive
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
          hid: 'description',
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
    // Allow the WHO data portal to embed the app in an iframe
    '/**': {
      headers: {
        'Content-Security-Policy':
          "frame-ancestors 'self' https://platform.who.int https://test-cms.platform.who.int"
      }
    },
    '/': {
      redirect: '/country-comparison'
    },
    '/country-comparison': {
      redirect: mapViewActive
        ? '/country-comparison/map-view'
        : '/country-comparison/table-view'
    },
    ...(mapViewActive
      ? {}
      : {
          '/country-comparison/map-view': {
            redirect: '/country-comparison/table-view'
          }
        })
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

    server: {
      watch: {
        ignored: ['**/.worktrees/**']
      }
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

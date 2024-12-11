import plugin from 'tailwindcss/plugin'
import Typography from '@tailwindcss/typography'
import elementPlus from './assets/scss/_element_plus.scss'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './types/**/*.ts',
    './assets/scss/**/*.scss'
  ],

  theme: {
    fontFamily: {
      sans: ['Nunito', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
      title: ['"Source Sans Pro', 'sans-serif']
    },

    extend: {
      typography: theme => ({
        DEFAULT: {
          css: {
            h1: { fontFamily: theme('fontFamily.title').join(', ') },
            h2: { fontFamily: theme('fontFamily.title').join(', ') },
            h3: { fontFamily: theme('fontFamily.title').join(', ') },
            h4: { fontFamily: theme('fontFamily.title').join(', ') },
            h5: { fontFamily: theme('fontFamily.title').join(', ') },
            h6: { fontFamily: theme('fontFamily.title').join(', ') }
          }
        }
      }),

      colors: {
        primary: {
          DEFAULT: 'var(--el-color-primary)',
          100: 'var(--el-color-primary-light-8)'
        },
        info: {
          DEFAULT: 'var(--el-color-info)',
          dark: 'var(--el-color-info-dark)',
          100: 'var(--el-color-info-light-8)'
        },
        success: {
          DEFAULT: 'var(--el-color-success)',
          100: 'var(--el-color-success-light-8)'
        },
        warning: {
          DEFAULT: 'var(--el-color-warning)',
          100: 'var(--el-color-warning-light-8)'
        },
        danger: {
          DEFAULT: 'var(--el-color-danger)',
          100: 'var(--el-color-danger-light-8)'
        },
        secondary: {
          DEFAULT: 'var(--el-text-color-secondary)',
          100: '#E4E4E4'
        }
      },

      backgroundColor: {
        page: 'var(--el-bg-color-page)'
      }
    }
  },

  plugins: [
    Typography,
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.u-content': {
          width: 'var(--content-width)',
          marginLeft: 'auto',
          marginRight: 'auto'
        },
        '.u-narrow-content': {
          width: 'var(--narrow-content-width)',
          marginLeft: 'auto',
          marginRight: 'auto'
        }
      })
    })
  ]
}

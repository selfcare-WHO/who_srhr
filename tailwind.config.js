import plugin from 'tailwindcss/plugin'
import Typography from '@tailwindcss/typography'

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
          DEFAULT:
            'color-mix(in srgb, var(--el-color-primary) calc(<alpha-value> * 100%), transparent)',
          100: 'var(--el-color-primary-light-8)'
        },
        info: {
          DEFAULT:
            'color-mix(in srgb, var(--el-color-info) calc(<alpha-value> * 100%), transparent)',
          dark: 'color-mix(in srgb, var(--el-color-info-dark) calc(<alpha-value> * 100%), transparent)',
          light:
            'color-mix(in srgb, var(--el-color-info-light) calc(<alpha-value> * 100%), transparent)',
          100: 'var(--el-color-info-light-8)'
        },
        success: {
          DEFAULT:
            'color-mix(in srgb, var(--el-color-success) calc(<alpha-value> * 100%), transparent)',
          100: 'var(--el-color-success-light-8)'
        },
        warning: {
          DEFAULT:
            'color-mix(in srgb, var(--el-color-warning) calc(<alpha-value> * 100%), transparent)',
          100: 'var(--el-color-warning-light-8)'
        },
        danger: {
          DEFAULT:
            'color-mix(in srgb, var(--el-color-danger) calc(<alpha-value> * 100%), transparent)',
          100: 'var(--el-color-danger-light-8)'
        },
        secondary: {
          DEFAULT:
            'color-mix(in srgb, var(--el-text-color-secondary) calc(<alpha-value> * 100%), transparent)',
          100: '#E4E4E4'
        }
      },

      backgroundColor: {
        page: 'var(--el-bg-color-page)',
        secondary: 'var(--el-bg-color-secondary)'
      },

      textColor: {
        primary: 'var(--el-text-color-primary)',
        regular: 'var(--el-text-color-regular)',
        secondary: 'var(--el-text-color-secondary)',
        placeholder: 'var(--el-text-color-placeholder)',
        disabled: 'var(--el-text-color-disabled)'
      }
    }
  },

  variants: {
    extend: {
      backgroundOpacity: ['active']
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

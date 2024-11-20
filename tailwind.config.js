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
        primary: 'var(--el-color-primary)',
        info: 'var(--el-color-info)'
      }
    }
  },

  plugins: [Typography]
}

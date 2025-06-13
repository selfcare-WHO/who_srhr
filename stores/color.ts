import { defineStore } from 'pinia'

export const useColorStore = defineStore('color', () => {
  const isCBFriendly = ref(false)

  const targetColor = computed(() => ({
    Achieved: 'var(--achieved)',
    Challenges: 'var(--challenges)',
    'Major Challenges': 'var(--major-challenges)',
    'No Data': 'var(--no-data)'
  }))

  watchImmediate(isCBFriendly, value => {
    if (value) {
      document.documentElement.style.setProperty(
        '--achieved',
        'var(--el-color-success-cbf)'
      )
      document.documentElement.style.setProperty(
        '--challenges',
        'var(--el-color-warning-cbf)'
      )
      document.documentElement.style.setProperty(
        '--major-challenges',
        'var(--el-color-danger-cbf)'
      )
      document.documentElement.style.setProperty(
        '--no-data',
        'var(--el-text-color-disabled)'
      )
      document.documentElement.style.setProperty(
        '--uncategorized',
        'var(--el-color-warning-cbf)'
      )

      // secondary shades
      document.documentElement.style.setProperty(
        '--achieved-secondary',
        'var(--achieved-secondary-cbf)'
      )
      document.documentElement.style.setProperty(
        '--challenges-secondary',
        'var(--challenges-secondary-cbf)'
      )
      document.documentElement.style.setProperty(
        '--major-challenges-secondary',
        'var(--major-challenges-secondary-cbf)'
      )
    } else {
      document.documentElement.style.setProperty(
        '--achieved',
        'var(--el-color-success)'
      )
      document.documentElement.style.setProperty(
        '--challenges',
        'var(--el-color-warning)'
      )
      document.documentElement.style.setProperty(
        '--major-challenges',
        'var(--el-color-danger)'
      )
      document.documentElement.style.setProperty(
        '--no-data',
        'var(--el-text-color-disabled)'
      )
      document.documentElement.style.setProperty(
        '--uncategorized',
        'var(--el-color-warning)'
      )

      // secondary shades (default palette)
      document.documentElement.style.setProperty(
        '--achieved-secondary',
        '#8acd32'
      )
      document.documentElement.style.setProperty(
        '--challenges-secondary',
        '#ff6633'
      )
      document.documentElement.style.setProperty(
        '--major-challenges-secondary',
        '#c934b3'
      )
    }
  })

  return { isCBFriendly, targetColor }
})

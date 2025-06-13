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
        'var(--el-color-primary-secondary-cbf)'
      )
      document.documentElement.style.setProperty(
        '--challenges-secondary',
        'var(--el-color-warning-secondary-cbf)'
      )
      document.documentElement.style.setProperty(
        '--major-challenges-secondary',
        'var(--el-color-danger-secondary-cbf)'
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
        'var(--el-color-primary-secondary)'
      )
      document.documentElement.style.setProperty(
        '--challenges-secondary',
        'var(--el-color-warning-secondary)'
      )
      document.documentElement.style.setProperty(
        '--major-challenges-secondary',
        'var(--el-color-danger-secondary)'
      )
    }
  })

  return { isCBFriendly, targetColor }
})

import { reactive, onMounted, getCurrentInstance } from 'vue'

export const useEnum = () => {
  const impactOnSrhr = reactive<Data.Legend>({
    supportive: {
      dbValue: 'Achieved',
      name: 'Supportive',
      icon: '',
      iconColor: 'var(--el-color-primary)',
      bgColor: '#ccd2de',
      borderColor: 'var(--el-color-primary)',
      solidColor: 'var(--achieved)'
    },
    partial: {
      name: 'Partial',
      dbValue: 'Challenges remain',
      icon: '',
      iconColor: '#E2E6ED',
      bgColor: '#66799D',
      borderColor: '#66799D',
      solidColor: 'var(--challenges)'
    },
    punitive: {
      name: 'Punitive',
      dbValue: 'Major challenges remain',
      icon: '',
      iconColor: '#ccd2de',
      bgColor: '#999999',
      borderColor: '#999999',
      solidColor: 'var(--major-challenges)'
    },
    noData: {
      name: 'No Data',
      dbValue: 'Data not available',
      icon: '',
      iconColor: 'var(--el-color-primary)',
      bgColor: 'transparent',
      borderColor: 'var(--el-color-primary)',
      solidColor: 'var(--no-data)'
    }
  })

  const targetStatus = reactive<Data.Legend>({
    Achieved: {
      name: 'Achieved',
      dbValue: 'Achieved',
      color: 'var(--achieved)'
    },
    'Challenges remain': {
      name: 'Challenges',
      dbValue: 'Challenges remain',
      color: 'var(--challenges)'
    },
    'Major challenges remain': {
      name: 'Major Challenges',
      dbValue: 'Major challenges remain',
      color: 'var(--major-challenges)'
    },
    'Data not available': {
      name: 'No Data',
      dbValue: 'Data not available',
      color: 'var(--no-data)'
    }
  })

  if (getCurrentInstance()) {
    onMounted(async () => {
      if (import.meta.client) {
        const [checkMark, minus, closeBold, questionMark] = await Promise.all([
          import('@assets/icons/check-mark.svg').then(m => m.default),
          import('@assets/icons/minus.svg').then(m => m.default),
          import('@assets/icons/close-bold.svg').then(m => m.default),
          import('@assets/icons/question-mark.svg').then(m => m.default)
        ])

        impactOnSrhr.supportive.icon = checkMark
        impactOnSrhr.partial.icon = minus
        impactOnSrhr.punitive.icon = closeBold
        impactOnSrhr.noData.icon = questionMark
      }
    })
  }

  return { impactOnSrhr, targetStatus }
}

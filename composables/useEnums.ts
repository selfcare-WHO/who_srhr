import { reactive, onMounted, getCurrentInstance } from 'vue'

export const useEnums = () => {
  const impactOnSrhr = reactive<Data.Legend>({
    supportive: {
      dbValue: 'Achieved',
      name: 'Supportive',
      icon: '',
      iconColor: 'var(--el-color-primary)',
      bgColor: '#ccd2de',
      borderColor: 'var(--el-color-primary)',
      solidColor: 'var(--el-color-success)'
    },
    partial: {
      name: 'Partial',
      dbValue: 'Challenges remain',
      icon: '',
      iconColor: '#E2E6ED',
      bgColor: '#66799D',
      borderColor: '#66799D',
      solidColor: 'var(--el-color-warning)'
    },
    punitive: {
      name: 'Punitive',
      dbValue: 'Major challenges remain',
      icon: '',
      iconColor: '#ccd2de',
      bgColor: '#999999',
      borderColor: '#999999',
      solidColor: 'var(--el-color-danger)'
    },
    noData: {
      name: 'No Data',
      dbValue: 'Data not available',
      icon: '',
      iconColor: 'var(--el-color-primary)',
      bgColor: 'transparent',
      borderColor: 'var(--el-color-primary)',
      solidColor: 'var(--el-text-color-placeholder)'
    }
  })

  const targetStatus = reactive<Data.Legend>({
    Achieved: {
      name: 'Achieved',
      dbValue: 'Achieved',
      color: 'var(--el-color-success)'
    },
    'Challenges remain': {
      name: 'Challenges',
      dbValue: 'Challenges remain',
      color: 'var(--el-color-warning)'
    },
    'Major challenges remain': {
      name: 'Major Challenges',
      dbValue: 'Major challenges remain',
      color: 'var(--el-color-danger)'
    },
    'Data not available': {
      name: 'No Data',
      dbValue: 'Data not available',
      color: 'var(--el-text-color-placeholder)'
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

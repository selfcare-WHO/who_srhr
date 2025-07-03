import { shallowReactive, onMounted, getCurrentInstance, markRaw } from 'vue'

export const useEnum = () => {
  const impactOnSrhr = shallowReactive<Data.Legend>({
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
      hatchPattern: true
    }
  })

  const targetStatus: Data.Legend = {
    Achieved: {
      name: 'Achieved',
      dbValue: 'Achieved',
      color: 'var(--achieved)',
      solidColor: 'var(--achieved)',
      secondaryColor: 'var(--achieved-secondary)'
    },
    'Challenges remain': {
      name: 'Challenges',
      dbValue: 'Challenges remain',
      color: 'var(--challenges)',
      solidColor: 'var(--challenges)',
      secondaryColor: 'var(--challenges-secondary)'
    },
    'Major challenges remain': {
      name: 'Major Challenges',
      dbValue: 'Major challenges remain',
      color: 'var(--major-challenges)',
      solidColor: 'var(--major-challenges)',
      secondaryColor: 'var(--major-challenges-secondary)'
    },
    'Data not available': {
      name: 'No Data',
      dbValue: 'Data not available',
      hatchPattern: true,
      color: 'url(~/assets/images/hatch-pattern.svg)',
      solidColor: 'var(--no-data)'
    }
  }

  const chartKey: Data.Legend = {
    highlighted: {
      name: 'Highlighted country',
      twClass: 'h-4 w-4 rounded-full bg-primary'
    },
    other: {
      name: 'Other countries',
      twClass: 'h-4 w-4 rounded-full bg-info-light/60'
    },
    globalTarget: {
      name: 'Global target',
      twClass: 'h-4 w-1 bg-primary'
    }
  }

  if (getCurrentInstance()) {
    onMounted(async () => {
      if (import.meta.client) {
        const [checkMark, minus, closeBold, questionMark] = await Promise.all([
          import('@assets/icons/check-mark.svg').then(m => m.default),
          import('@assets/icons/minus.svg').then(m => m.default),
          import('@assets/icons/close-bold.svg').then(m => m.default),
          import('@assets/icons/question-mark.svg').then(m => m.default)
        ])

        impactOnSrhr.supportive.icon = markRaw(checkMark as any)
        impactOnSrhr.partial.icon = markRaw(minus as any)
        impactOnSrhr.punitive.icon = markRaw(closeBold as any)
        impactOnSrhr.noData.icon = markRaw(questionMark as any)
      }
    })
  }

  return { impactOnSrhr, targetStatus, chartKey }
}

import checkMark from '@assets/icons/check-mark.svg'
import minus from '@assets/icons/minus.svg'
import closeBold from '@assets/icons/close-bold.svg'
import questionMark from '@assets/icons/question-mark.svg'

export const ImpactOnSrhr = {
  supportive: {
    dbValue: 'Achieved',
    name: 'Supportive',
    icon: checkMark,
    iconColor: 'var(--el-color-primary)',
    bgColor: '#ccd2de',
    borderColor: 'var(--el-color-primary)'
  },
  partial: {
    name: 'Partial',
    dbValue: 'Challenges remain',
    icon: minus,
    iconColor: '#E2E6ED',
    bgColor: '#66799D',
    borderColor: '#66799D'
  },
  punitive: {
    name: 'Punitive',
    dbValue: 'Major challenges remain',
    icon: closeBold,
    iconColor: '#ccd2de',
    bgColor: '#999999',
    borderColor: '#999999'
  },
  noData: {
    dbValue: 'Data not available',
    name: 'No Data',
    icon: questionMark,
    iconColor: 'var(--el-color-primary)',
    bgColor: 'transparent',
    borderColor: 'var(--el-color-primary)'
  }
}

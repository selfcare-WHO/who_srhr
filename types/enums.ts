import QuestionMark from '@assets/icons/question-mark.svg'
import CheckMark from '@assets/icons/check-mark.svg'
import Minus from '@assets/icons/minus.svg'
import CloseBold from '@assets/icons/close-bold.svg'

export const TargetStatus = {
  achieved: {
    name: 'Achieved',
    dbValue: 'Achieved',
    color: 'var(--el-color-success)'
  },
  challenges: {
    name: 'Challenges',
    dbValue: 'Challenges remain',
    color: 'var(--el-color-warning)'
  },
  majorChallenges: {
    name: 'Major Challenges',
    dbValue: 'Major challenges remain',
    color: 'var(--el-color-danger)'
  },
  noData: {
    name: 'No Data',
    dbValue: 'Data not available',
    color: 'var(--el-text-color-placeholder)'
  }
}

export const ImpactOnSrhr = {
  supportive: {
    dbValue: 'Achieved',
    name: 'Supportive',
    icon: CheckMark,
    iconColor: 'var(--el-color-primary)',
    bgColor: '#ccd2de',
    borderColor: 'var(--el-color-primary)'
  },
  partial: {
    name: 'Partial',
    dbValue: 'Challenges remain',
    icon: Minus,
    iconColor: '#E2E6ED',
    bgColor: '#66799D',
    borderColor: '#66799D'
  },
  punitive: {
    name: 'Punitive',
    dbValue: 'Major challenges remain',
    icon: CloseBold,
    iconColor: '#ccd2de',
    bgColor: '#999999',
    borderColor: '#999999'
  },
  noData: {
    dbValue: 'Data not available',
    name: 'No Data',
    icon: QuestionMark,
    iconColor: 'var(--el-color-primary)',
    bgColor: 'transparent',
    borderColor: 'var(--el-color-primary)'
  }
}

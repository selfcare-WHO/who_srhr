let checkMark, minus, closeBold, questionMark

if (import.meta.client) {
  checkMark = (await import('@assets/icons/check-mark.svg')).default
  minus = (await import('@assets/icons/minus.svg')).default
  closeBold = (await import('@assets/icons/close-bold.svg')).default
  questionMark = (await import('@assets/icons/question-mark.svg')).default
}

export const TargetStatus: Map.Legend = {
  Achieved: {
    value: 'Achieved',
    dbValue: 'Achieved',
    color: 'var(--el-color-success)'
  },
  'Challenges remain': {
    value: 'Challenges',
    dbValue: 'Challenges remain',
    color: 'var(--el-color-warning)'
  },
  'Major challenges remain': {
    value: 'Major Challenges',
    dbValue: 'Major challenges remain',
    color: 'var(--el-color-danger)'
  },
  'Data not available': {
    value: 'No Data',
    dbValue: 'Data not available',
    color: 'var(--el-text-color-placeholder)'
  }
}

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

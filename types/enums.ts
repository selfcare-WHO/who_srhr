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

// Function to load icons dynamically
const loadIcon = (path: string) => {
  return () => (import.meta.client ? import(path) : Promise.resolve(undefined))
}

export const ImpactOnSrhr = {
  supportive: {
    dbValue: 'Achieved',
    name: 'Supportive',
    iconLoader: loadIcon('@assets/icons/check-mark.svg'),
    iconColor: 'var(--el-color-primary)',
    bgColor: '#ccd2de',
    borderColor: 'var(--el-color-primary)'
  },
  partial: {
    name: 'Partial',
    dbValue: 'Challenges remain',
    iconLoader: loadIcon('@assets/icons/minus.svg'),
    iconColor: '#E2E6ED',
    bgColor: '#66799D',
    borderColor: '#66799D'
  },
  punitive: {
    name: 'Punitive',
    dbValue: 'Major challenges remain',
    iconLoader: loadIcon('@assets/icons/close-bold.svg'),
    iconColor: '#ccd2de',
    bgColor: '#999999',
    borderColor: '#999999'
  },
  noData: {
    dbValue: 'Data not available',
    name: 'No Data',
    iconLoader: loadIcon('@assets/icons/question-mark.svg'),
    iconColor: 'var(--el-color-primary)',
    bgColor: 'transparent',
    borderColor: 'var(--el-color-primary)'
  }
}

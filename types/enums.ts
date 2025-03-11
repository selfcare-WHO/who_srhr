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

const parseCssVar = (varName: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(varName) ||
    '#cccccc'
  )
}

export const useMapStyles = ({
  dataTypeFilterValue,
  dataMinValue,
  dataMaxValue,
  indicator
}: {
  dataTypeFilterValue: Ref<string>
  dataMinValue: Ref<number>
  dataMaxValue: Ref<number>
  indicator: ComputedRef<Prisma.IndicatorWithSubgroups>
}) => {
  const targetsPaint = computed<mapboxgl.LayerSpecification['paint']>(() => ({
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.75
    ],
    'fill-color': [
      'case',
      ['==', ['get', 'change'], 'Achieved'],
      getStatusColor('Achieved'),
      ['==', ['get', 'change'], 'Challenges remain'],
      getStatusColor('Challenges remain'),
      ['==', ['get', 'change'], 'Major challenges remain'],
      getStatusColor('Major challenges remain'),
      ['==', ['get', 'change'], 'Data not available'],
      getStatusColor('Data not available'),
      // fallback color
      getStatusColor('Data not available')
    ]
  }))

  const heatmapPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    const min = dataMinValue.value
    const max = dataMaxValue.value
    const range = max - min

    return {
      'fill-color': [
        'case',
        ['to-boolean', ['get', 'value']],
        [
          'case',
          // Yep, this hack sucks... ¯\_(ツ)_/¯
          [
            '!=',
            ['to-number', ['get', 'value'], -999999999999999],
            -999999999999999
          ],
          [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'value']],
            min,
            parseCssVar('--el-bg-color-heatmap-0'),
            min + range / 4,
            parseCssVar('--el-bg-color-heatmap-25'),
            min + (range / 4) * 2,
            parseCssVar('--el-bg-color-heatmap-50'),
            min + (range / 4) * 3,
            parseCssVar('--el-bg-color-heatmap-75'),
            max,
            parseCssVar('--el-bg-color-heatmap-100')
          ],
          // Fallback for non-numeric values
          parseCssVar('--el-color-warning')
        ],
        // Default case when property doesn't exist (No data)
        parseCssVar('--el-text-color-disabled')
      ]
    }
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue?.value === 'numerical_categorical') {
      if (indicator?.value?.type === 'Nominal') return targetsPaint.value
      else return heatmapPaint.value
    }

    if (['laws_policies', 'targets'].includes(dataTypeFilterValue?.value)) {
      return targetsPaint.value
    }

    return {}
  })

  return {
    countriesPaint
  }
}

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
  const targetsPaint: mapboxgl.LayerSpecification['paint'] = {
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
      ['==', ['get', 'change'], 'Data not available '],
      getStatusColor('Data not available'),
      // fallback color
      getStatusColor('Data not available')
    ]
  }

  const heatmapPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    const min = dataMinValue.value
    const max =
      dataMinValue.value === dataMaxValue.value
        ? dataMinValue.value + 1
        : dataMaxValue.value

    return {
      'fill-color': [
        'case',
        ['to-boolean', ['get', 'value']],
        [
          'case',
          // Use a numeric fallback (0) and check if the value is a number and not 0
          // (assuming 0 is not a valid data point in your dataset)
          ['!=', ['to-number', ['get', 'value'], 0], 0],
          [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'value'], 0],
            min,
            parseCssVar('--el-bg-color-heatmap-min'),
            max,
            parseCssVar('--el-bg-color-heatmap-max')
          ],
          // Fallback color for non-numeric values
          parseCssVar('--el-color-warning')
        ],
        // Default case: when 'value' doesn't exist or is null
        parseCssVar('--el-text-color-disabled')
      ]
    }
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue?.value === 'numerical_categorical') {
      if (indicator?.value?.type === 'Nominal') return targetsPaint
      else return heatmapPaint.value
    }

    if (['laws_policies', 'targets'].includes(dataTypeFilterValue?.value)) {
      return targetsPaint
    }

    return {}
  })

  return {
    countriesPaint
  }
}

export const getCountriesPaint = (
  dataTypeFilterValue: Ref<string>,
  dataMinValue: Ref<number>,
  dataMaxValue: Ref<number>
) => {
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
        'interpolate',
        ['linear'],
        ['to-number', ['get', 'value']],
        min,
        parseCssVar('--el-bg-color-heatmap-min'),
        max,
        parseCssVar('--el-bg-color-heatmap-max')
      ]
    }
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue?.value === 'targets') return targetsPaint
    if (dataTypeFilterValue?.value === 'nominal') return targetsPaint
    if (dataTypeFilterValue?.value === 'heatmap') return heatmapPaint.value

    return {}
  })

  return {
    countriesPaint
  }
}

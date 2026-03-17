const parseCssVar = (varName: string): string => {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim() || '#cccccc'
  )
}

/** Mix a hex color 25 % toward white (same visual effect as 0.75 opacity over white). */
const lighten = (hex: string, amount = 0.25): string => {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.round(r + (255 - r) * amount)
  const lg = Math.round(g + (255 - g) * amount)
  const lb = Math.round(b + (255 - b) * amount)
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`
}

export const useMapStyles = ({
  dataTypeFilterValue,
  indicator,
  subgroup,
  jenksBreaks,
  nominalLegend
}: {
  dataTypeFilterValue: Ref<string>
  indicator: ComputedRef<Prisma.IndicatorWithSubgroups>
  subgroup?: ComputedRef<Prisma.Subgroup | undefined>
  jenksBreaks: ComputedRef<number[] | undefined>
  nominalLegend?: ComputedRef<Data.Legend | undefined>
}) => {
  const { hatchUri } = useHatchPattern()
  const colorStore = useColorStore()
  const { isCBFriendly } = storeToRefs(colorStore)

  const isInvertScale = computed(() => {
    return subgroup?.value?.invertScale ?? false
  })

  const targetsPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    // Read isCBFriendly to create a Vue dependency — parseCssVar reads
    // CSS variables that the color store sets synchronously
    void isCBFriendly.value

    const achieved = parseCssVar('--achieved')
    const challenges = parseCssVar('--challenges')
    const majorChallenges = parseCssVar('--major-challenges')

    return {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        [
          'case',
          ['==', ['get', 'change'], 'Achieved'],
          lighten(achieved),
          ['==', ['get', 'change'], 'Challenges remain'],
          lighten(challenges),
          ['==', ['get', 'change'], 'Major challenges remain'],
          lighten(majorChallenges),
          'rgba(0,0,0,0)'
        ],
        [
          'case',
          ['==', ['get', 'change'], 'Achieved'],
          achieved,
          ['==', ['get', 'change'], 'Challenges remain'],
          challenges,
          ['==', ['get', 'change'], 'Major challenges remain'],
          majorChallenges,
          'rgba(0,0,0,0)'
        ]
      ]
    }
  })

  const heatmapPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    // Reactive dependency on CBF and invert scale
    void isCBFriendly.value
    void isInvertScale.value

    if (!jenksBreaks?.value || jenksBreaks.value.length === 0) return {}

    const breaks = jenksBreaks.value.map(breakPoint =>
      typeof breakPoint === 'string' ? Number(breakPoint) : breakPoint
    )

    if (breaks.some(value => Number.isNaN(value))) return {}

    const jenksIndexes = [0, 1, 2, 3, 4]

    const resolveJenksColor = (originalIdx: number) => {
      const mappedIdx = isInvertScale.value
        ? jenksIndexes[jenksIndexes.length - 1 - originalIdx]
        : originalIdx
      return parseCssVar(`--el-bg-color-jenks-${mappedIdx}`)
    }

    let dynamicClassification: any

    if (breaks.length === 1) {
      dynamicClassification = resolveJenksColor(0)
    } else {
      dynamicClassification = ['case']

      for (let i = breaks.length - 1; i > 0; i -= 1) {
        dynamicClassification.push(
          ['>', ['to-number', ['get', 'value']], breaks[i]],
          resolveJenksColor(i)
        )
      }

      dynamicClassification.push(resolveJenksColor(0))
    }

    const otherColor = parseCssVar('--el-color-warning')

    return {
      'fill-color': [
        'case',
        ['to-boolean', ['get', 'value']],
        [
          'case',
          [
            '!=',
            ['to-number', ['get', 'value'], -999999999999999],
            -999999999999999
          ],
          dynamicClassification,
          otherColor
        ],
        'rgba(0,0,0,0)'
      ]
    }
  })

  const nominalPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    // Reactive dependency on CBF
    void isCBFriendly.value

    if (
      dataTypeFilterValue.value !== 'numerical_categorical' ||
      indicator.value?.type !== 'Nominal' ||
      !nominalLegend?.value
    )
      return {}

    const bucketKeys = Object.keys(nominalLegend.value)

    if (bucketKeys.length === 0) return {}

    const colorExpression: any[] = ['match', ['get', 'bucketKey']]
    const hoverColorExpression: any[] = ['match', ['get', 'bucketKey']]
    bucketKeys.forEach(key => {
      const item = nominalLegend!.value![key]
      let colorValue = item?.color || '#cccccc'
      if (colorValue.startsWith('var(')) {
        const varName = colorValue.slice(4, -1)
        colorValue = parseCssVar(varName)
      }
      colorExpression.push(key, colorValue)
      hoverColorExpression.push(key, lighten(colorValue))
    })
    colorExpression.push('rgba(0,0,0,0)')
    hoverColorExpression.push('rgba(0,0,0,0)')

    return {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        hoverColorExpression,
        colorExpression
      ]
    } as mapboxgl.LayerSpecification['paint']
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue.value === 'numerical_categorical') {
      if (indicator.value?.type === 'Nominal') return nominalPaint.value
      return heatmapPaint.value
    }

    if (['laws_policies', 'targets'].includes(dataTypeFilterValue.value)) {
      return targetsPaint.value
    }

    return { 'fill-color': 'rgba(0,0,0,0)' }
  })

  // Register the hatch pattern image once on map load
  useMapbox('world-map', map => {
    map.on('load', () => {
      if (!map.hasImage('hatch-pattern')) {
        loadSVGAsImage({
          id: 'hatch-pattern',
          map,
          svgDataUri: hatchUri,
          pixelRatio: 2
        })
      }
    })
  })

  return {
    countriesPaint
  }
}

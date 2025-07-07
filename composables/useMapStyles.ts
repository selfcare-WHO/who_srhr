const parseCssVar = (varName: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(varName) ||
    '#cccccc'
  )
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

  const mapLoaded = ref(false)

  const isInvertScale = computed(() => {
    return subgroup?.value?.invertScale ?? false
  })

  const targetsPaint = computed<mapboxgl.LayerSpecification['paint']>(() => ({
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      0.75,
      1
    ],
    'fill-pattern': [
      'case',
      ['==', ['get', 'change'], 'Achieved'],
      'achieved',
      ['==', ['get', 'change'], 'Challenges remain'],
      'challenges-remain',
      ['==', ['get', 'change'], 'Major challenges remain'],
      'major-challenges-remain',
      ['==', ['get', 'change'], 'Data not available'],
      'hatch-pattern',
      // fallback color
      'hatch-pattern'
    ]
  }))

  const heatmapPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (!jenksBreaks?.value || jenksBreaks.value.length === 0) return {}

    const breaks = jenksBreaks.value.map(breakPoint =>
      typeof breakPoint === 'string' ? Number(breakPoint) : breakPoint
    )

    // Abort if any breakpoint cannot be converted to a number
    if (breaks.some(value => Number.isNaN(value))) return {}

    let dynamicClassification: any

    if (breaks.length === 1) {
      dynamicClassification = 'jenks-0'
    } else {
      dynamicClassification = ['case']

      for (let i = breaks.length - 1; i > 0; i -= 1) {
        dynamicClassification.push(
          ['>', ['to-number', ['get', 'value']], breaks[i]],
          `jenks-${i}`
        )
      }

      dynamicClassification.push('jenks-0')
    }

    return {
      'fill-pattern': [
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
          'other'
        ],
        'hatch-pattern'
      ]
    }
  })

  const nominalPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (
      !mapLoaded.value ||
      dataTypeFilterValue.value !== 'numerical_categorical' ||
      indicator.value?.type !== 'Nominal' ||
      !nominalLegend?.value
    )
      return {}

    const bucketKeys = Object.keys(nominalLegend.value)

    if (bucketKeys.length === 0) return {}

    const patternExpression: any[] = ['match', ['get', 'bucketKey']]
    bucketKeys.forEach(key => {
      patternExpression.push(key, key)
    })
    patternExpression.push('hatch-pattern')

    const paint: any = {
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.75,
        1
      ],
      'fill-pattern': patternExpression
    }

    return paint as mapboxgl.LayerSpecification['paint']
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (!mapLoaded.value) return {}

    if (dataTypeFilterValue.value === 'numerical_categorical') {
      if (indicator.value?.type === 'Nominal') return nominalPaint.value
      return heatmapPaint.value
    }

    if (['laws_policies', 'targets'].includes(dataTypeFilterValue.value)) {
      return targetsPaint.value
    }

    return {}
  })

  useMapbox('world-map', map => {
    const registerSolidPatterns = () => {
      const solidColorMap: Record<string, string> = {}

      const jenksIndexes = [0, 1, 2, 3, 4]

      const getVarName = (idx: number) => `--el-bg-color-jenks-${idx}`

      jenksIndexes.forEach(originalIdx => {
        const mappedIdx = isInvertScale.value
          ? jenksIndexes[jenksIndexes.length - 1 - originalIdx]
          : originalIdx

        solidColorMap[`jenks-${originalIdx}`] = generateSolidColorSVG(
          parseCssVar(getVarName(mappedIdx))
        )
      })

      Object.assign(solidColorMap, {
        other: generateSolidColorSVG(parseCssVar('--el-color-warning')),
        achieved: generateSolidColorSVG(parseCssVar('--achieved')),
        'challenges-remain': generateSolidColorSVG(parseCssVar('--challenges')),
        'major-challenges-remain': generateSolidColorSVG(
          parseCssVar('--major-challenges')
        ),
        'data-not-available': generateSolidColorSVG(parseCssVar('--no-data'))
      })

      // Include nominal legend buckets as solid patterns
      if (nominalLegend?.value) {
        Object.entries(nominalLegend.value).forEach(([bucketKey, item]) => {
          if (item?.color) {
            let colorValue = item.color
            if (colorValue.startsWith('var(')) {
              const varName = colorValue.slice(4, -1)
              colorValue = parseCssVar(varName)
            }

            solidColorMap[bucketKey] = generateSolidColorSVG(colorValue)
          }
        })
      }

      Object.entries(solidColorMap).forEach(([patternName, svg]) => {
        // Remove existing image to allow re-adding with new data
        if (map.hasImage(patternName)) {
          map.removeImage(patternName)
        }

        loadSVGAsImage({
          id: patternName,
          map,
          svgDataUri: svg as string,
          pixelRatio: 1
        })
      })
    }

    const registerHatchPattern = () => {
      if (!map.hasImage('hatch-pattern')) {
        loadSVGAsImage({
          id: 'hatch-pattern',
          map,
          svgDataUri: hatchUri,
          pixelRatio: 2
        })
      }
    }

    map.on('load', () => {
      mapLoaded.value = true
      registerHatchPattern()

      watchImmediate(
        isCBFriendly,
        () => {
          registerSolidPatterns()
          nextTick(() => map.triggerRepaint())
        },
        { flush: 'post' }
      )

      // Re-register patterns whenever the nominal legend changes
      watchImmediate(
        nominalLegend ?? ref({}),
        () => {
          registerSolidPatterns()
          nextTick(() => map.triggerRepaint())
        },
        { flush: 'post' }
      )

      // Re-register patterns whenever the colour scale inversion flag changes
      watchImmediate(
        isInvertScale,
        () => {
          registerSolidPatterns()
          nextTick(() => map.triggerRepaint())
        },
        { flush: 'post' }
      )

      nextTick(() => map.triggerRepaint())
    })
  })

  return {
    countriesPaint
  }
}

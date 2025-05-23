const parseCssVar = (varName: string): string => {
  return (
    getComputedStyle(document.documentElement).getPropertyValue(varName) ||
    '#cccccc'
  )
}

export const useMapStyles = ({
  dataTypeFilterValue,
  indicator,
  jenksBreaks
}: {
  dataTypeFilterValue: Ref<string>
  indicator: ComputedRef<Prisma.IndicatorWithSubgroups>
  jenksBreaks: ComputedRef<number[] | undefined>
}) => {
  const { hatchUri } = useHatchPattern()
  const colorStore = useColorStore()
  const { isCBFriendly } = storeToRefs(colorStore)

  const mapLoaded = ref(false)

  const targetsPaint = computed<mapboxgl.LayerSpecification['paint']>(() => ({
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.75
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
    if (!jenksBreaks?.value) return {}

    return {
      'fill-pattern': [
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
            'step',
            ['to-number', ['get', 'value']],
            // jenksBreaks.value[0],
            'jenks-0',
            jenksBreaks.value[1],
            'jenks-1',
            jenksBreaks.value[2],
            'jenks-2',
            jenksBreaks.value[3],
            'jenks-3',
            jenksBreaks.value[4],
            'jenks-4'
          ],
          // Fallback for non-numeric values
          'other'
        ],
        // Default case when property doesn't exist (No data)
        'hatch-pattern'
      ]
    }
  })

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (!mapLoaded.value) return {}

    if (dataTypeFilterValue?.value === 'numerical_categorical') {
      if (indicator?.value?.type === 'Nominal') return targetsPaint.value
      else return heatmapPaint.value
    }

    if (['laws_policies', 'targets'].includes(dataTypeFilterValue?.value)) {
      return targetsPaint.value
    }

    return {}
  })

  useMapbox('world-map', map => {
    const registerSolidPatterns = () => {
      const solidColorMap: Record<Map.JenksKey | Map.StatusKey | Map.OtherKey, string> = {
        'jenks-0': generateSolidColorSVG(parseCssVar('--el-bg-color-jenks-0')),
        'jenks-1': generateSolidColorSVG(parseCssVar('--el-bg-color-jenks-1')),
        'jenks-2': generateSolidColorSVG(parseCssVar('--el-bg-color-jenks-2')),
        'jenks-3': generateSolidColorSVG(parseCssVar('--el-bg-color-jenks-3')),
        'jenks-4': generateSolidColorSVG(parseCssVar('--el-bg-color-jenks-4')),
        'other': generateSolidColorSVG(parseCssVar('--el-color-warning')),
        achieved: generateSolidColorSVG(parseCssVar('--achieved')),
        'challenges-remain': generateSolidColorSVG(
          parseCssVar('--challenges')
        ),
        'major-challenges-remain': generateSolidColorSVG(
          parseCssVar('--major-challenges')
        ),
        'data-not-available': generateSolidColorSVG(
          parseCssVar('--no-data')
        )
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

      nextTick(() => map.triggerRepaint())
    })
  })

  return {
    countriesPaint
  }
}

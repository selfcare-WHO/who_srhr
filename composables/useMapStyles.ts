import { ImpactOnSrhr } from '~/types/clientEnums'

import CheckMark from '@assets/icons/check-mark.png'
import Minus from '@assets/icons/minus.png'
import CloseBold from '@assets/icons/close-bold.png'
import QuestionMark from '@assets/icons/question-mark.png'

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

  const lawsPoliciesPaint: mapboxgl.LayerSpecification['paint'] = {
    'fill-color': [
      'case',
      ['==', ['get', 'change'], 'Achieved'],
      ImpactOnSrhr.supportive.bgColor,
      ['==', ['get', 'change'], 'Challenges remain'],
      ImpactOnSrhr.partial.bgColor,
      ['==', ['get', 'change'], 'Major challenges remain'],
      ImpactOnSrhr.punitive.bgColor,
      ['==', ['get', 'change'], 'Data not available '],
      ImpactOnSrhr.noData.bgColor,

      // fallback color
      ImpactOnSrhr.noData.bgColor
    ],
    'fill-pattern': [
      'case',
      ['==', ['get', 'change'], 'Achieved'],
      'icon-check-mark',
      ['==', ['get', 'change'], 'Challenges remain'],
      'icon-minus',
      ['==', ['get', 'change'], 'Major challenges remain'],
      'icon-close-bold',
      ['==', ['get', 'change'], 'Data not available '],
      'icon-question-mark',
      // fallback pattern
      'icon-question-mark'
    ],
    'fill-opacity': [
      'case',
      ['boolean', ['feature-state', 'hover'], false],
      1,
      0.75
    ]
  }

  const countriesPaint = computed<mapboxgl.LayerSpecification['paint']>(() => {
    if (dataTypeFilterValue?.value === 'numerical_categorical') {
      if (indicator?.value?.type === 'Nominal') return targetsPaint
      else return heatmapPaint.value
    }
    if (dataTypeFilterValue?.value === 'laws_policies') {
      return lawsPoliciesPaint
    }
    if (dataTypeFilterValue?.value === 'targets') {
      return targetsPaint
    }

    return {}
  })

  useMapbox('world-map', map => {
    const loadMapIcon = (imageSource: string, iconName: string) => {
      map.loadImage(imageSource, (err, image) => {
        if (err) throw err

        if (image) {
          map.addImage(iconName, image, {
            pixelRatio: 3
          })
        }
      })
    }

    loadMapIcon(CheckMark, 'icon-check-mark')
    loadMapIcon(Minus, 'icon-minus')
    loadMapIcon(CloseBold, 'icon-close-bold')
    loadMapIcon(QuestionMark, 'icon-question-mark')
  })

  return {
    countriesPaint
  }
}

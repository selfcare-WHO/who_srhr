import type { ColumnDefinition } from 'tabulator-tables'
import { TargetStatus } from '@enums'

interface MatrixRow {
  country: string
  [key: string]: any
}

interface UseTableDataOptions {
  onIndicatorHover: (event: MouseEvent) => void
  onIndicatorLeave: (event: MouseEvent) => void
}

export const useTableData = ({
  onIndicatorHover,
  onIndicatorLeave
}: UseTableDataOptions) => {
  const filtersStore = useFiltersStore()
  const {
    availableCountries,
    availableIndicators,
    indicatorFilterValue,
    countryFilterValue
  } = storeToRefs(filtersStore)

  const dataStore = useDataStore()
  const { dataPoints } = storeToRefs(dataStore)

  const currentCountries = computed<Prisma.Country[]>(() => {
    const filteredCountryIds = countryFilterValue.value || []
    return filteredCountryIds.length === 0
      ? availableCountries.value
      : availableCountries.value.filter(country =>
          filteredCountryIds.includes(String(country.id))
        )
  })

  const currentIndicators = computed<Prisma.IndicatorWithSubgroups[]>(() => {
    const filteredIndicatorIds = indicatorFilterValue.value
    return filteredIndicatorIds.length === 0
      ? availableIndicators.value
      : availableIndicators.value.filter(indicator =>
          filteredIndicatorIds.includes(indicator.id)
        )
  })

  const createIndicatorColumns = (
    indicator: Prisma.IndicatorWithSubgroups
  ): ColumnDefinition => ({
    title: indicator.name,
    tooltip: true,
    titleFormatter: () => {
      const container = document.createElement('div')
      container.className = 'flex gap-1 items-center'

      const span = document.createElement('span')
      span.className =
        'table-indicator-name text-primary font-bold text-sm truncate'
      span.textContent = indicator.name

      const img: HTMLImageElement & Data.IndicatorTooltipData =
        document.createElement('img')
      img.src = new URL('/assets/icons/info-circle.svg', import.meta.url).href
      img.className = 'table-indicator-info-icon w-4 h-4 cursor-pointer'
      img.addEventListener('mouseover', onIndicatorHover)
      img.addEventListener('mouseout', onIndicatorLeave)
      img.fullName = indicator.fullName
      img.subheading = indicator.subheading

      container.appendChild(span)
      container.appendChild(img)

      return container
    },
    resizable: false,
    headerSort: false,
    headerWordWrap: true,
    hozAlign: 'center',
    vertAlign: 'middle',
    columns: indicator.subgroups.map(subgroup => ({
      width: 150,
      title: subgroup.name,
      field: `${indicator.id}-${subgroup.id}`,
      headerSort: false,
      formatter: cell => {
        const dataPoint = cell.getValue()

        const element = document.createElement('div')
        element.className = 'indicator-cell-container flex items-center gap-1'
        element.style.width = '100%'
        element.style.height = '100%'

        const innerDiv: HTMLElement = document.createElement('div')

        if (dataPoint?.target !== 'No target') {
          innerDiv.className = 'indicator-target-circle w-4 h-4 rounded-full'

          const targetStatus = Object.values(TargetStatus).find(
            status => status.dbValue === dataPoint?.target
          )

          innerDiv.style.backgroundColor = targetStatus?.color || ''

          element.appendChild(innerDiv)
        }

        const numberElement = document.createElement('span')
        const value = dataPoint?.value
        const { type } = dataPoint?.indicator || {}

        numberElement.className = 'indicator-progress-value'
        numberElement.textContent = getFormattedValue(value, type)

        element.appendChild(numberElement)

        return element
      }
    }))
  })

  const getFormattedValue = (value: Data.Value, type?: string): string => {
    const postfix = type === 'Percentage' ? '%' : ''

    if (value === null || value === undefined) return 'n/d'

    return `${value}${postfix}`
  }

  const columns = computed((): ColumnDefinition[] => {
    const baseColumns: ColumnDefinition[] = [
      {
        title: '',
        field: 'country',
        width: 300,
        frozen: true,
        resizable: false,
        headerSort: false,
        vertAlign: 'middle'
      }
    ]

    const indicatorColumns: ColumnDefinition[] = currentIndicators.value.map(
      createIndicatorColumns
    )

    return [...baseColumns, ...indicatorColumns]
  })

  const data = computed(() => {
    const dataPointsMap = new Map<string, Prisma.DataPointWithType>()

    dataPoints.value.forEach(dp => {
      const key = `${dp.countryId}-${dp.indicatorId}-${dp.subgroupId}`
      dataPointsMap.set(key, dp)
    })

    return currentCountries.value.map(country => {
      const row: MatrixRow = { country: country.name }
      currentIndicators.value.forEach(indicator => {
        indicator.subgroups.forEach(subgroup => {
          const key = `${country.id}-${indicator.id}-${subgroup.id}`
          const dataPoint = dataPointsMap.get(key)

          if (dataPoint) {
            row[`${indicator.id}-${subgroup.id}`] = dataPoint
          }
        })
      })

      return row
    })
  })

  return {
    columns,
    data
  }
}

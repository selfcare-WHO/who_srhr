import type { ColumnDefinition } from 'tabulator-tables'

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

    if (filteredCountryIds.length === 0) return availableCountries.value

    return availableCountries.value.filter(country =>
      filteredCountryIds?.includes(String(country.id))
    )
  })

  const currentIndicators = computed<Prisma.IndicatorWithSubgroups[]>(() => {
    const filteredIndicatorIds = indicatorFilterValue.value

    if (filteredIndicatorIds.length === 0) return availableIndicators.value

    return availableIndicators.value.filter(indicator =>
      filteredIndicatorIds.includes(indicator.id)
    )
  })

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
        // headerWordWrap: true
      }
    ]

    const indicatorColumns = currentIndicators.value.map(indicator => ({
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
        // title: subgroup.name === 'Data' ? '' : subgroup.name,
        title: subgroup.name,
        field: `${indicator.id}-${subgroup.id}`,
        headerSort: false
      }))
    }))

    return [...baseColumns, ...indicatorColumns] as ColumnDefinition[]
  })

  const data = computed(() => {
    const result: MatrixRow[] = []
    const dataPointsMap = new Map<string, Prisma.DataPoint>()

    dataPoints.value.forEach(dp => {
      const key = `${dp.countryId}-${dp.indicatorId}-${dp.subgroupId}`
      dataPointsMap.set(key, dp)
    })

    currentCountries.value.forEach(country => {
      const row: MatrixRow = {
        country: country.name
      }

      currentIndicators.value.forEach(indicator => {
        indicator.subgroups.forEach(subgroup => {
          const key = `${country.id}-${indicator.id}-${subgroup.id}`
          const dataPoint = dataPointsMap.get(key)

          if (dataPoint) {
            row[`${indicator.id}-${subgroup.id}`] = dataPoint.value
          }
        })
      })

      result.push(row)
    })

    return result
  })

  return {
    columns,
    data
  }
}

import type { ColumnDefinition } from 'tabulator-tables'

interface MatrixRow {
  country: string
  [key: string]: any
}

export const useTableData = () => {
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
      titleFormatter: () => `
        <div class="flex flex-col gap-1">
          <span
            class="table-indicator-name text-primary font-bold text-sm
              truncate line-clamp-3"
          >
            ${indicator.fullName}
          </span>

          <span class="truncate line-clamp-2">
            ${indicator.subheading === '-' ? '' : indicator.subheading}
          </span>
        </div>
      `,
      resizable: false,
      headerSort: false,
      headerWordWrap: true,
      hozAlign: 'center',
      vertAlign: 'middle',
      columns: indicator.subgroups.map(subgroup => ({
        width: 150,
        title: subgroup.name === 'Data' ? '' : subgroup.name,
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

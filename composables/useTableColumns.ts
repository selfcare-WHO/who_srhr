import type { ColumnDefinition } from 'tabulator-tables'

import { ElIcon } from 'element-plus'
import { createVNode, render } from 'vue'

export const useTableColumns = () => {
  const tableFiltersStore = useTableFiltersStore()
  const { filteredIndicators } = storeToRefs(tableFiltersStore)
  const { impactOnSrhr } = useEnums()

  const createIndicatorColumns = (
    indicator: Prisma.IndicatorWithSubgroups
  ): ColumnDefinition => ({
    title: indicator.fullName,
    titleFormatter: () => {
      if (!indicator.fullName) return ''

      const container = document.createElement('div')
      container.className = 'flex flex-col gap-1'

      const span = document.createElement('span')
      span.className = 'table-indicator-name text-primary font-bold text-sm'
      span.id = `table-indicator-name-${indicator.id}`
      span.textContent = indicator.fullName
      container.appendChild(span)
      // useClamp({ id: span.id })

      const hasSubheading = indicator.subheading && indicator.subheading !== '-'

      if (hasSubheading) {
        const subheading = document.createElement('span')

        subheading.className = 'table-indicator-subheading text-sm'
        subheading.id = `table-indicator-subheading-${indicator.id}`
        subheading.textContent = indicator.subheading

        container.appendChild(subheading)
        // useClamp({ id: subheading.id, singleLine: true })
      }

      return container
    },
    resizable: false,
    headerSort: false,
    headerWordWrap: true,
    hozAlign: 'center',
    vertAlign: 'middle',
    columns: indicator.subgroups.map(subgroup => ({
      width: 150,
      resizable: false,
      title: subgroup.fullName,
      field: `${indicator.id}-${subgroup.id}`,
      headerSort: false,
      formatter: cell => {
        const dataPoint: Prisma.DataPoint = cell.getValue()

        if (!dataPoint) return ''

        const element = document.createElement('div')
        element.className = 'indicator-cell-container flex items-center gap-2'
        element.style.width = '100%'
        element.style.height = '100%'

        const innerDiv: HTMLElement = document.createElement('div')

        if (indicator.hasTarget && dataPoint?.change !== 'No target') {
          innerDiv.className = 'indicator-target-circle w-4 h-4 rounded-full'

          innerDiv.style.backgroundColor = getStatusColor(dataPoint?.change)

          element.appendChild(innerDiv)
        }

        if (indicator.isLaw) {
          innerDiv.className =
            'indicator-law-circle w-4 h-4 rounded-full border-2 flex items-center justify-center'

          const impact = Object.values(impactOnSrhr).find(
            status => status.dbValue === dataPoint?.change
          )

          innerDiv.style.backgroundColor = impact?.bgColor || ''
          innerDiv.style.borderColor = impact?.borderColor || ''

          const iconVNode = createVNode(
            ElIcon,
            {
              color: impact?.iconColor,
              size: '10'
            },
            {
              default: () => (impact?.icon ? createVNode(impact.icon) : null)
            }
          )

          render(iconVNode, innerDiv)
          element.appendChild(innerDiv)
        }

        const numberElement = document.createElement('span')

        numberElement.className = 'indicator-progress-value flex-1 min-w-0'
        numberElement.textContent = formatData({ indicator, dataPoint })
        numberElement.id = `indicator-progress-value-${indicator.id}-${subgroup.id}-${dataPoint.countryId}`

        element.appendChild(numberElement)

        // useClamp({ id: numberElement.id, singleLine: true })

        return element
      }
    }))
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
      }
    ]

    const indicatorColumns: ColumnDefinition[] = (
      filteredIndicators?.value || []
    ).map(createIndicatorColumns)

    return [...baseColumns, ...indicatorColumns]
  })

  return {
    columns
  }
}

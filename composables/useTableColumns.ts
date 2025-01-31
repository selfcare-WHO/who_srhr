import type { ColumnDefinition } from 'tabulator-tables'
import { TargetStatus, ImpactOnSrhr } from '@enums'
import StringMask from 'string-mask'
import { ElIcon } from 'element-plus'
import { createVNode, render } from 'vue'

export const useTableColumns = () => {
  const filtersStore = useFiltersStore()
  const { filteredIndicators } = storeToRefs(filtersStore)

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
      useClamp({ id: span.id })

      const hasSubheading = indicator.subheading && indicator.subheading !== '-'

      if (hasSubheading) {
        const subheading = document.createElement('span')

        subheading.className = 'table-indicator-subheading text-sm'
        subheading.id = `table-indicator-subheading-${indicator.id}`
        subheading.textContent = indicator.subheading

        container.appendChild(subheading)
        useClamp({ id: subheading.id, singleLine: true })
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

          const targetStatus = Object.values(TargetStatus).find(
            status => status.dbValue === dataPoint?.change
          )

          innerDiv.style.backgroundColor = targetStatus?.color || ''

          element.appendChild(innerDiv)
        }

        if (indicator.isLaw) {
          innerDiv.className =
            'indicator-law-circle w-4 h-4 rounded-full border-2 flex items-center justify-center'

          const impactOnSrhr = Object.values(ImpactOnSrhr).find(
            status => status.dbValue === dataPoint?.change
          )

          innerDiv.style.backgroundColor = impactOnSrhr?.bgColor || ''
          innerDiv.style.borderColor = impactOnSrhr?.borderColor || ''

          const iconVNode = createVNode(
            ElIcon,
            {
              color: impactOnSrhr?.iconColor,
              size: '10'
            },
            {
              default: () =>
                impactOnSrhr?.icon ? createVNode(impactOnSrhr.icon) : null
            }
          )

          render(iconVNode, innerDiv)
          element.appendChild(innerDiv)
        }

        const numberElement = document.createElement('span')

        numberElement.className = 'indicator-progress-value flex-1 min-w-0'
        numberElement.textContent = getFormattedValue({ indicator, dataPoint })
        numberElement.id = `indicator-progress-value-${indicator.id}-${subgroup.id}-${dataPoint.countryId}`

        element.appendChild(numberElement)

        useClamp({ id: numberElement.id, singleLine: true })

        return element
      }
    }))
  })

  const getFormattedValue = ({
    indicator,
    dataPoint
  }: {
    indicator: Prisma.IndicatorWithSubgroups
    dataPoint: Prisma.DataPoint
  }): string => {
    const { type, translateValue, displayValue, mask } = indicator || {}
    const { value, originalValue } = dataPoint || {}
    const renderedValue =
      displayValue === 'original_value' ? originalValue : value

    const postfix = type === 'Percentage' ? '%' : ''

    if (
      renderedValue === null ||
      renderedValue === undefined ||
      renderedValue === ''
    )
      return 'n/d'

    if (translateValue) {
      const translateObject = JSON.parse(translateValue)

      if (translateObject[renderedValue]) {
        const translatedValue = translateObject[renderedValue]
        return `${translatedValue}${postfix}`
      }
    }

    if (mask) {
      const maskedValue = StringMask.apply(renderedValue, mask, {
        reverse: true
      })

      return `${maskedValue}${postfix}`
    }

    return `${renderedValue}${postfix}`
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

    const indicatorColumns: ColumnDefinition[] = filteredIndicators.value.map(
      createIndicatorColumns
    )

    return [...baseColumns, ...indicatorColumns]
  })

  return {
    columns
  }
}

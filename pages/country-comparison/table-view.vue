<template lang="pug">
  .table-view(class="bg-page py-4")
    div.u-content
      ElForm(
        class="filters-section grid grid-cols-3  gap-6"
        #default
        label-position="top"
      )
        ElFormItem(
          v-for="filter in tableFilters"
          :key="filter.label"
          class="col-span-1"
          :label="filter.label"
        )
          FilterItem(
            v-model="filter.value"
            :options="filter.options"
            :label="filter.label"
            :multiple="!!filter?.multiple"
            :tree="filter.tree"
            :placeholder="filter.placeholder"
            :clearable="!!filter?.clearable"
          )

      TableKeySection(:dataType="filterValues?.dataType")

      div(class="table-wrapper relative min-h-[700px] overflow-x-auto")
        div(ref="tableElement" :key="`table-${isCBFriendly}`")

      p(class="text-sm text-secondary mt-4 mb-0")
        | The data used are the latest available as of 31/07/2025 that are less than 10 years old and from reliable international data repositories. The source and year of each data point are available via the map view or the country profile.

    ElTooltip(
      virtual-triggering
      width="200px"
      placement="top"
      :visible="showTooltip"
      :virtual-ref="tooltipData.element"
      :key="tooltipData.element?.id"
      :persistent="false"
    )
      template(#content)
        div(class="flex flex-col gap-1 max-w-[200px]")
          span.font-bold {{ tooltipData.fullName }}

          span(v-if="tooltipData.subheading") ({{ tooltipData.subheading }})
</template>

<script lang="ts" setup>
  import { TabulatorFull as Tabulator } from 'tabulator-tables'
  import { useSyncRouteFilters } from '~/composables/useSyncRouteFilters'

  const TABLE_HEIGHT = 785

  defineOptions({ name: 'CountryComparisonTable' })

  const tableFiltersStore = useTableFiltersStore()
  const {
    dataTypeFilterValue,
    indicatorFilterValue,
    countryFilterValue,
    filterValues
  } = storeToRefs(tableFiltersStore)

  const { tableFilters, indicatorFilter } = tableFiltersStore

  // Keep filter refs <-> URL query synchronized
  useSyncRouteFilters({
    dataType: {
      ref: dataTypeFilterValue,
      validValues: ['numerical_categorical', 'laws_policies']
    },
    indicator: {
      ref: indicatorFilterValue,
      parse: (raw: any) =>
        Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? raw.split(',')
            : [],
      stringify: (val: string[]) => val.join(','),
      validate: (vals: string[]) =>
        vals.every(v =>
          indicatorFilter.options?.some(opt => {
            if (Array.isArray(opt.children)) {
              return opt.children.some(child => child.id === v)
            }
            return false
          })
        ),
      waitForReady: () => indicatorFilter.options?.length > 0
    },
    country: {
      ref: countryFilterValue,
      parse: (raw: any) =>
        Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? raw.split(',')
            : [],
      stringify: (val: string[]) => val.join(',')
    }
  })

  const tooltipData = reactive<Data.IndicatorTooltipData>({})
  const showTooltip = ref(false)

  const { columns } = useTableColumns()

  const colorStore = useColorStore()
  const { isCBFriendly } = storeToRefs(colorStore)

  const tabulator = ref<Tabulator | null>(null)
  const tableElement = ref<HTMLElement | null>(null)

  const isFetching = ref(false)
  const initializedTable = ref(false)

  const setColumns = () => {
    if (tabulator.value && columns.value?.length) {
      tabulator.value?.setColumns(columns.value)
      nextTick(() => {
        tabulator.value?.redraw()
      })
    }
  }

  const initTable = () => {
    if (!tableElement.value || !filterValues.value) {
      requestAnimationFrame(initTable)
      return
    }

    tabulator.value = new Tabulator(tableElement.value as HTMLElement, {
      height: TABLE_HEIGHT,
      columnHeaderVertAlign: 'bottom',
      renderHorizontal: 'basic',
      renderVertical: 'virtual',
      layout: 'fitDataFill',
      selectable: false,
      pagination: true,
      paginationSize: 12,
      ajaxURL: '/api/table-data',
      paginationMode: 'remote',
      reactiveData: true,
      ajaxParams: () => ({
        filters: JSON.stringify({
          dataType: dataTypeFilterValue.value,
          indicator: indicatorFilterValue.value,
          country: countryFilterValue.value
        })
      }),
      ajaxRequesting: () => {
        isFetching.value = true
        return true
      },
      ajaxResponse: (url, params, response) => {
        isFetching.value = false
        return response
      }
    })

    tabulator.value.on('tableBuilt', () => {
      setColumns()
      initializedTable.value = true
    })
  }

  onActivated(() => {
    if (!initializedTable.value) initTable()
  })

  watchEffect(() => {
    if (filterValues.value) initTable()
  })
</script>

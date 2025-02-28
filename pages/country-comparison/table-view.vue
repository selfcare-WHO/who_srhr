<template lang="pug">
  .table-view(class="bg-page py-4")
    div.u-content
      ElForm(
        class="filters-section flex gap-6"
        #default
        label-position="top"
      )
        ElFormItem(
          v-for="filter in filters"
          :key="filter.label"
          class="w-[285px]"
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

      KeySection(:dataType="filterValues.dataType")

      div(class="table-wrapper relative min-h-[700px]")
        div(ref="tableElement")
    
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

  const TABLE_HEIGHT = 757

  defineOptions({ name: 'CountryComparisonTable' })

  const tableFiltersStore = useTableFiltersStore()
  const { filterValues } = storeToRefs(tableFiltersStore)
  const { filters } = tableFiltersStore

  const tooltipData = reactive<Data.IndicatorTooltipData>(
    {}
  )
  const showTooltip = ref(false)

  const { columns } = useTableColumns()

  const tabulator = ref<Tabulator | null>(null)
  const tableElement = ref<HTMLElement | null>(null)

  const isFetching = ref(false)

  const initTable = () => {
    const getElement = () => {
      if (!tableElement.value) {
        requestAnimationFrame(getElement)
      } else {
        tabulator.value = new Tabulator(
          tableElement.value,
          {
            height: TABLE_HEIGHT,
            columnHeaderVertAlign: 'bottom',
            renderHorizontal: 'basic',
            renderVertical: 'virtual',
            layout: 'fitDataFill',
            selectable: false,
            pagination: true,
            paginationSize: 10,
            ajaxURL: '/api/paginated-data',
            paginationMode: 'remote',
            reactiveData: true,
            ajaxParams: () => ({
              filters: JSON.stringify(filterValues.value)
            }),
            ajaxRequesting: (url, params) => {
              isFetching.value = true
              return true
            },
            ajaxResponse: (url, params, response) => {
              isFetching.value = false
              return response
            }
          }
        )

        return
      }
    }

    return getElement()
  }

  onMounted(() => {
    nextTick(initTable)
  })

  watch(columns, val => {
    tabulator.value?.setColumns(val)
  })
</script>

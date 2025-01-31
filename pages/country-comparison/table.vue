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
            @blur="updateTable"
            @remove-tag="updateTable"
            @clear="updateTable"
          )

      KeySection(:dataType="filterValues.dataType")

      div(class="table-wrapper relative min-h-[700px]")
        .loader-overlay(
          class="absolute inset-0 pointer-events-none"
          v-loading="isLoading || isLoadingTable"
        )

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

  const TABLE_HEIGHT = 763

  const filtersStore = useFiltersStore()
  const { isFetchingFilters, filterValues } = storeToRefs(filtersStore)
  const { filters } = filtersStore

  const dataStore = useDataStore()
  const { isLoadingData } = storeToRefs(dataStore)

  const isBuildingTable = ref(true)

  const isLoading = computed(
    () => isFetchingFilters.value || isLoadingData.value
  )

  const isLoadingTable = computed(
    () =>
      isLoadingTableData.value ||
      isLoadingTableColumns.value ||
      isBuildingTable.value
  )

  const isLoadingTableData = ref(true)
  const isLoadingTableColumns = ref(true)

  const tooltipData = reactive<Data.IndicatorTooltipData>({})

  const showTooltip = ref(false)

  const onIndicatorHover = (event: MouseEvent) => {
    const element = event.target as HTMLElement & Prisma.Indicator
    const { fullName, subheading } = element

    tooltipData.fullName = fullName
    tooltipData.subheading = subheading ?? undefined
    tooltipData.element = element
    showTooltip.value = true
  }

  const onIndicatorLeave = (event: MouseEvent) => {
    showTooltip.value = false
  }

  const { columns, data } = useTableData({
    onIndicatorHover,
    onIndicatorLeave
  })
  const tabulator = ref<Tabulator | null>(null)
  const tableElement = ref<HTMLElement | null>(null)

  const initTable = () => {
    const getElement = () => {
      if (!tableElement.value) {
        requestAnimationFrame(getElement)
      } else {
        tabulator.value = new Tabulator(tableElement.value, {
          height: TABLE_HEIGHT,
          columnHeaderVertAlign: 'bottom',
          reactiveData: true,
          renderHorizontal: 'basic',
          renderVertical: 'virtual',
          data: data.value,
          columns: columns.value,
          layout: 'fitDataFill',
          selectable: false,
          pagination: true,
          paginationSize: 12
        })

        tabulator.value.on('tableBuilt', () => {
          isBuildingTable.value = false
        })

        tabulator.value.on('dataLoaded', () => {
          isLoadingTableData.value = false
        })

        tabulator.value.on('columnsLoaded', () => {
          isLoadingTableColumns.value = false
        })

        return
      }
    }

    return getElement()
  }

  const updateTable = () => {
    if (!tabulator.value) {
      initTable()
    } else {
      isLoadingTableData.value = true
      isLoadingTableColumns.value = true

      tabulator.value?.setColumns(columns.value)
      tabulator.value?.setData(data.value)

      nextTick(() => {
        tabulator.value?.redraw()
      })
    }
  }

  watch([columns, data], () => {
    if (!isLoading.value) nextTick(updateTable)
  })

  onBeforeRouteLeave(() => {
    tabulator?.value?.destroy()

    const infoIcons: HTMLImageElement[] = Array.from(
      document.querySelectorAll('.table-indicator-info-icon')
    )

    infoIcons.forEach(icon => {
      icon.removeEventListener('mouseover', onIndicatorHover)
      icon.removeEventListener('mouseout', onIndicatorLeave)
    })
  })
</script>

<style lang="sass" scoped></style>

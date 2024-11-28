<template lang="pug">
  .table-view(class="bg-white py-4")
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

      .key-section(class="flex items-center gap-4")
        span(class="text-primary font-bold text-sm")
          | TARGET STATUS:

        .key-item(
          v-for="target in Object.values(TargetStatus)"
          class="flex items-center gap-2"
          :key="target.name"
        )
          .rounded-full.h-4.w-4(
            :style="{ backgroundColor: target.color }"
          )

          span {{ target.name }}

      div(
        class="table-wrapper min-h-[500px]"
        :class="{ 'mb-[200px]': isLoading || isBuildingTable }"	
        v-loading="isLoading || isBuildingTable"
      )
        #table-element()
    
    //- ElTooltip(
    //-   :content="tooltipContent"
    //-   virtual-triggering
    //-   :virtual-ref="triggerRef"
    //- )
</template>

<script lang="ts" setup>
  import { TargetStatus } from '@enums'
  import { TabulatorFull as Tabulator } from 'tabulator-tables'

  const TABLE_HEIGHT = 700

  const filtersStore = useFiltersStore()
  const { fetchedFilters, isFetchingFilters } = storeToRefs(filtersStore)
  const { fetchFilterOptions, filters } = filtersStore

  const dataStore = useDataStore()
  const { isLoadingData } = storeToRefs(dataStore)

  const isBuildingTable = ref(true)

  const isLoading = computed(
    () => isFetchingFilters.value || isLoadingData.value
  )

  const { columns, data } = useTableData()
  const tabulator = ref<Tabulator | null>(null)

  const initTable = () => {
    const getElement = () => {
      const tableElement = document.getElementById('table-element')

      if (!tableElement) {
        requestAnimationFrame(getElement)
      } else {
        tabulator.value = new Tabulator(tableElement, {
          height: TABLE_HEIGHT,
          columnHeaderVertAlign: 'bottom',
          renderHorizontal: 'basic',
          renderVertical: 'basic',
          data: data.value,
          columns: columns.value,
          layout: 'fitDataFill',
          selectable: false
        })

        tabulator.value.on('tableBuilt', () => {
          isBuildingTable.value = false
        })

        return
      }
    }

    return getElement()
  }

  if (!fetchedFilters.value) fetchFilterOptions()

  const updateTable = () => {
    if (
      !tabulator ||
      !tabulator.value?.setColumns ||
      !tabulator.value?.setData
    ) {
      initTable()
    } else {
      tabulator.value?.setColumns(columns.value)
      tabulator.value?.setData(data.value)
    }
  }

  watch(isLoading, newValue => {
    if (!newValue) nextTick(updateTable)
  })

  onBeforeRouteLeave(() => {
    tabulator?.value?.destroy()
  })
</script>

<style lang="sass" scoped>
  .table-view
</style>

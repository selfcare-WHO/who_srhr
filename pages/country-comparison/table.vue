<template lang="pug">
  .bg-white.py-4
    div.u-content
      ElForm(
        class="filters-section flex gap-6"
        #default
        label-position="top"
      )
        ElFormItem(
          v-for="(filter, index) in filters"
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
            @blur="fetchFilterItems"
            @clear="fetchFilterItems"
            @remove-tag="fetchFilterItems"
            @change="fetchFilterItems"
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
</template>

<script lang="ts" setup>
  import { TargetStatus } from '@enums'
  import { TabulatorFull as Tabulator } from 'tabulator-tables'

  const filtersStore = useFiltersStore()
  const { filters } = storeToRefs(filtersStore)
  const { fetchFilterItems } = filtersStore

  let table: Tabulator

  const initTable = () => {
    let tableElement: HTMLElement | null = null

    const getElement = () => {
      tableElement = document.getElementById('matrix-view')
      // if (!tableElement) {
      //   requestAnimationFrame(getElement)
      // } else {
      //   table = new Tabulator('#matrix-view', {
      //     ajaxLoader: true,
      //     reactiveData: true,
      //     data: data.value,
      //     columns: columns.value,
      //     groupBy: 'domain',
      //     groupHeader: value => value,
      //     layout: 'fitDataFill',
      //     maxHeight: '100%',
      //     height: '100%',
      //     selectable: false
      //   })
      // }
    }

    getElement()
  }

  onMounted(initTable)
</script>

<style lang="sass" scoped></style>

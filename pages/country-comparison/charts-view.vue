<template lang="pug">
  .charts-view(class="bg-page py-4")
    div.u-content
      ElForm(
        class="filters-section flex gap-6"
        #default
        label-position="top"
      )
        ElFormItem(
          v-for="filter in chartFilters"
          :key="filter.label"
          class="w-[375px]"
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

      ChartKey

      div(class="chart-wrapper relative min-h-[700px]")
        ChartPaginated(class="w-full h-full")
</template>

<script lang="ts" setup>
  defineOptions({ name: 'CountryComparisonCharts' })

  const chartFiltersStore = useChartFiltersStore()
  const { chartFilters } = chartFiltersStore

  // // For color blind friendly colors
  // const colorStore = useColorStore()
  // const { isCBFriendly } = storeToRefs(colorStore)
</script>

<style lang="sass" scoped>
  .chart-wrapper
    background-color: white
    border-radius: 8px
    padding: 20px
    margin-top: 20px

  .chart-container
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr))
    gap: 20px
</style>

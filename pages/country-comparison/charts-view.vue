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
          class="flex-1"
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
  import { useSyncRouteFilters } from '~/composables/useSyncRouteFilters'
  import { storeToRefs } from 'pinia'

  defineOptions({ name: 'CountryComparisonCharts' })

  const chartFiltersStore = useChartFiltersStore()

  const { indicatorFilterValue, countryFilterValue, highlightFilterValue } =
    storeToRefs(chartFiltersStore)

  const { chartFilters } = chartFiltersStore

  // Keep filter refs <-> route query synchronized
  useSyncRouteFilters({
    indicator: {
      ref: indicatorFilterValue,
      parse: (raw: any) =>
        Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? raw.split(',')
            : [],
      stringify: (val: string[]) => val.join(',')
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
    },
    highlight: {
      ref: highlightFilterValue
    }
  })

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

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
      
      div(class="chart-wrapper relative min-h-[700px]" v-loading="isFetching")
        div(
          ref="chartContainer"
          class="chart-container w-full h-full"
          :key="`chart-${isCBFriendly}`"
        )
        
        .flex.justify-center.items-center.h-full.w-full(v-if="!filteredIndicators.length || !selectedCountries.length")
          ElEmpty(description="Please select at least one indicator and one country to display charts")
        
        ChartsDemographic(v-else)
</template>

<script lang="ts" setup>
  defineOptions({ name: 'CountryComparisonCharts' })

  // Import the chart store
  const chartFiltersStore = useChartFiltersStore()
  const { filterValues, filteredIndicators } = storeToRefs(chartFiltersStore)
  const { chartFilters } = chartFiltersStore

  // For color blind friendly colors
  const colorStore = useColorStore()
  const { isCBFriendly } = storeToRefs(colorStore)

  // State
  const isFetching = ref(false)
  const chartContainer = ref<HTMLElement | null>(null)

  // Computed values to check if we have data to display
  const selectedCountries = computed(() => {
    return filterValues.value?.country || []
  })

  // Handle fetching chart data when filters change
  watch(
    [filterValues, isCBFriendly],
    async () => {
      if (!filteredIndicators.value.length || !selectedCountries.value.length)
        return

      try {
        isFetching.value = true
        // Here we would fetch the chart data and render charts
        // For each indicator and selected countries
        await fetchChartData()
      } finally {
        isFetching.value = false
      }
    },
    { deep: true }
  )

  // Fetch and render chart data
  const fetchChartData = async () => {
    // Implementation would fetch data for selected indicators and countries
    // Then render appropriate charts in the chartContainer element
    // Example:
    // const data = await $fetch('/api/chart-data', {
    //   query: {
    //     filters: JSON.stringify(filterValues.value)
    //   }
    // })
    //
    // renderCharts(data)
  }

  // When view is activated (for keep-alive)
  onActivated(() => {
    if (filteredIndicators.value.length && selectedCountries.value.length) {
      fetchChartData()
    }
  })
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

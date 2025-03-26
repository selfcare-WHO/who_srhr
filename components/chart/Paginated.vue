<script setup lang="ts">
  import { useChartData } from '~/composables/useChartData'

  const props = defineProps({
    itemsPerPage: {
      type: Number,
      default: 5
    }
  })

  const { chartData, isFetching } = useChartData()
  const currentPage = ref(1)

  const paginatedChartData = computed(() => {
    if (!chartData.value?.length) return []

    const startIndex = (currentPage.value - 1) * props.itemsPerPage
    const endIndex = startIndex + props.itemsPerPage

    return chartData.value.slice(startIndex, endIndex)
  })

  const goToPage = (page: number) => {
    currentPage.value = page
  }

  // Reset to first page when chart data changes
  watch(
    () => chartData.value,
    () => {
      currentPage.value = 1
    },
    { deep: true }
  )
</script>

<template lang="pug">
.chart-table(class="w-full" v-loading="isFetching")
  .charts-container(
    v-if="chartData?.length"
    class="flex flex-col gap-4"
  )
    ChartDotPlot(
      v-for="chart in paginatedChartData"
      :key="`chart-${chart.indicatorId}-${chart.subgroupName}`"
      :data="chart"
    )
    
    .pagination-controls(class="flex justify-center items-center gap-2 mt-6 mb-4")
      ElPagination(
        v-model:current-page="currentPage"
        :page-size="itemsPerPage"
        :total="chartData?.length || 0"
        layout="prev, pager, next"
        @current-change="goToPage"
        :pager-count="5"
        background
      )

  ElEmpty(
    v-else
    class="flex items-center justify-center min-h-[200px]"
    description="Please select at least one indicator and one country to display charts"
  )
</template>

<style lang="sass" scoped>
  .chart-table
    background-color: white
    border-radius: 8px
    padding: 20px
</style>

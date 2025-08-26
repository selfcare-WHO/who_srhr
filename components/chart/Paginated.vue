<script setup lang="ts">
  import { useChartData } from '~/composables/useChartData'

  const props = defineProps({
    itemsPerPage: {
      type: Number,
      default: 5
    }
  })

  const { chartData, isFetching, page, total, goToPage, updateItemsPerPage } =
    useChartData({ pagination: true })

  // Initialize items per page from props
  onMounted(() => {
    updateItemsPerPage(props.itemsPerPage)
  })

  // Update if props change
  watch(
    () => props.itemsPerPage,
    newValue => {
      updateItemsPerPage(newValue)
    }
  )
</script>

<template lang="pug">
.chart-table(v-loading="isFetching" class="flex flex-col bg-white rounded-lg p-5")
  .charts-container(
    v-if="chartData?.length"
    class="flex-1 flex flex-col gap-4 w-full items-center"
  )
    ChartDotPlot(
      v-for="chart in chartData"
      :key="`chart-${chart.indicatorId}-${chart.subgroupName}`"
      :data="chart"
    )

  ElEmpty(
    v-else-if="!isFetching"
    class="flex-1 flex self-center min-h-[200px] max-w-[400px]"
    description="Data not available for the selected indicators in these countries. Try selecting different countries or indicators to view available data."
  )

  .pagination-controls(class="flex-none flex justify-center items-center gap-2 mt-6 mb-4")
    ElPagination(
      v-if="!isFetching"
      v-model:current-page="page"
      :page-size="itemsPerPage"
      :total="total"
      layout="prev, pager, next"
      @current-change="goToPage"
      :pager-count="5"
      background
    )
</template>

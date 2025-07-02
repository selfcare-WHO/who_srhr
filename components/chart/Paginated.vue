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
.chart-table(class="w-full" v-loading="isFetching")
  .charts-container(
    v-if="chartData?.length"
    class="flex flex-col gap-4"
  )
    ChartDotPlot(
      v-for="chart in chartData"
      :key="`chart-${chart.indicatorId}-${chart.subgroupName}`"
      :data="chart"
    )

    .pagination-controls(class="flex justify-center items-center gap-2 mt-6 mb-4")
      ElPagination(
        v-model:current-page="page"
        :page-size="itemsPerPage"
        :total="total"
        layout="prev, pager, next"
        @current-change="goToPage"
        :pager-count="5"
        background
      )

  ElEmpty(
    v-else
    class="flex items-center justify-center min-h-[200px]"
    description="Data not available for the selected indicators in these countries. Try selecting different countries or indicators to view available data."
  )
</template>

<style lang="sass" scoped>
  .chart-table
    background-color: white
    border-radius: 8px
    padding: 20px
</style>

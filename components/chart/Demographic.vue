<script setup lang="ts">
  import { useChartData } from '~/composables/useChartData'

  const { chartData, isFetching } = useChartData()
</script>

<template lang="pug">
.demographic-charts(class="w-full" v-loading="isFetching")
  .charts-container(
    v-if="chartData?.length"
    class="flex flex-col gap-4"
  )
    ChartDotPlot(
      v-for="chart in chartData"
      :key="`chart-${chart.indicatorId}-${chart.subgroupName}`"
      :data="chart"
    )

  ElEmpty(
    v-else
    class="flex items-center justify-center min-h-[200px]"
    description="Please select at least one indicator and one country to display charts"
  )
</template>

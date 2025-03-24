<script setup lang="ts">
  import { useChartData } from '~/composables/useChartData'

  const { chartData, isFetching } = useChartData()
</script>

<template lang="pug">
.demographic-charts(v-loading="isFetching")
  .charts-container(v-if="chartData?.length")
   ChartDumbbell(
      v-for="chart in chartData"
      :key="`chart-${chart.indicatorId}-${chart.subgroupName}`"
      :data="chart"
    )

  ElEmpty(
    v-else
    description="Please select at least one indicator and one country to display charts"
  )
</template>

<style lang="scss" scoped>
  .demographic-charts {
    width: 100%;

    .chart-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;

      .chart-key {
        display: flex;
        gap: 16px;

        .key-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;

          .key-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;

            &.highlighted {
              background-color: #193f77;
            }

            &.regular {
              background-color: #a4cef8;
            }
          }

          .key-line {
            width: 16px;
            height: 2px;
            background-color: #000;
          }
        }
      }
    }

    .charts-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .empty-state {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>

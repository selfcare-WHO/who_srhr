<script setup lang="ts">
  import { useChartData } from '~/composables/useChartData'

  const { chartData } = useChartData()
</script>

<template lang="pug">
.demographic-charts
  .chart-header
    .chart-key
      .key-item
        .key-dot.highlighted
        span Highlighted country
      
      .key-item  
        .key-dot.regular
        span Other countries
      
      .key-item
        .key-line
        span Global target
  
  .charts-container(v-if="chartData?.length")
   ChartDumbbell(
      v-for="chart in chartData"
      :key="chart.id"
      :data="chart"
    )
  
  .empty-state(v-else)
    el-empty(
      description="No data available. Please select indicators."
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

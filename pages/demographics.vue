<script setup lang="ts">
  import { useChartFiltersStore } from '~/stores/chartFilters'
  import DemographicCharts from '~/components/charts/Demographic.vue'

  const chartFiltersStore = useChartFiltersStore()
  const { chartFilters } = storeToRefs(chartFiltersStore)

  // SEO
  useHead({
    title: 'Demographic Indicators'
  })
</script>

<template lang="pug">
.demographics-page
  .filter-container
    //- FilterBar(:filters="chartFilters")
  
  .charts-container
    DemographicCharts
</template>

<style lang="scss" scoped>
  .demographics-page {
    padding: 24px;

    .filter-container {
      margin-bottom: 24px;
    }

    .charts-container {
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
  }
</style>

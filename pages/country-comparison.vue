<template lang="pug">
  .flex.flex-col.flex-1.min-h-0
    .country-comparison-page.u-content
      h1 Country comparison
      p Compare data across countries through maps, charts and tables. The chart view only shows numeric data, while the map and table views show numeric and categorical data.

      .flex.items-center.gap-3
        h2.text-secondary.mr-3 Select view:
        NuxtLink(to="/country-comparison/map")
          ElButton.w-32(type="primary" :plain="!mapView") Map
        NuxtLink(to="/country-comparison/charts")
          ElButton.w-32(type="primary" :plain="!chartsView") Charts
        NuxtLink(to="/country-comparison/table")
          ElButton.w-32(type="primary" :plain="!tableView") Table

    NuxtPage.flex-1
</template>

<script lang="ts" setup>
  definePageMeta({
    middleware: ['country-comparison']
  })

  const route = useRoute()

  const mapView = computed(() => {
    return route.path === '/country-comparison/map'
  })

  const chartsView = computed(() => {
    return route.path === '/country-comparison/charts'
  })

  const tableView = computed(() => {
    return route.path === '/country-comparison/table'
  })
</script>

<template lang="pug">
  .flex.flex-col.flex-1.min-h-0
    .country-comparison-page.u-content
      h1 Country comparison
      p Compare data across countries through maps, charts and tables. The chart view only shows numerical data, while the map and table views show numerical and categorical data.

      LayoutMobileEmptyState(v-if="!isDesktop")

      .flex.justify-between.items-center.gap-3(v-else)
        .flex.items-center.gap-3
          h2.text-secondary.mr-3 Select view:
          NuxtLink(to="/country-comparison/map-view")
            ElButton.w-32(type="primary" :plain="!mapView") Map
          NuxtLink(to="/country-comparison/charts-view")
            ElButton.w-32(type="primary" :plain="!chartsView") Charts
          NuxtLink(to="/country-comparison/table-view")
            ElButton.w-32(type="primary" :plain="!tableView") Table

        .flex.items-center.gap-3
          h2.text-secondary Color blind friendly
          ElSwitch(
            v-model="isCBFriendly"
          )
    NuxtPage.flex-1(v-if="isDesktop" keep-alive)
</template>

<script lang="ts" setup>
  definePageMeta({
    layout: false,
    middleware: ['country-comparison']
  })

  const colorStore = useColorStore()
  const { isCBFriendly } = storeToRefs(colorStore)

  useSyncRouteFilters({
    cb: {
      ref: isCBFriendly,
      parse: (val: unknown) => {
        if (Array.isArray(val)) val = val[0]
        if (typeof val === 'string') {
          return ['1', 'true'].includes(val.toLowerCase())
        }
        return false
      },
      stringify: (val: boolean) => (val ? '1' : '')
    }
  })

  const { isDesktop } = useResponsive()

  const route = useRoute()

  const mapView = computed(() => {
    return route.path === '/country-comparison/map-view'
  })

  const chartsView = computed(() => {
    return route.path === '/country-comparison/charts-view'
  })

  const tableView = computed(() => {
    return route.path === '/country-comparison/table-view'
  })
</script>

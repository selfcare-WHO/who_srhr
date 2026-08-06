<template lang="pug">
  .map-view(
    class="bg-page py-4 flex-1"
    @mousemove="onGlobalMouseMove"
  )
    div.u-content
      MapFilters

      .map-container(
        class="relative h-[940px] w-full"
        v-loading="isFetching || isInitializing || isMapRefreshing"
      )
        MapboxMap(
          class="h-full w-full rounded-lg transition-opacity duration-150"
          :class="{ 'opacity-0': isFetching || isInitializing || isMapRefreshing }"
          map-id="world-map"
          :options="mapOptions"
          @wheel.passive="onWheel"
          @drag="showPopover = false"
          @mouseleave="showPopover = false"
        )
          MapboxSource(
            source-id="who-world-features"
            :source="linkedFeaturesSource"
          )

          //- Mounted in draw order and all anchored at the same WHO layer, so
            each one inserts directly before it: hatch, then choropleth, then
            country outlines — all beneath WHO's boundaries and labels.
          MapboxLayer(
            :layer="countriesHatchLayer"
            :before-layer="WHO_BASEMAP_ANCHOR_LAYER"
          )
          MapboxLayer(
            :layer="countriesLayer"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
            :before-layer="WHO_BASEMAP_ANCHOR_LAYER"
          )
          MapboxLayer(
            :layer="countriesBoundaryLayer"
            :before-layer="WHO_BASEMAP_ANCHOR_LAYER"
          )

          MapDetailsPopover(
            v-model="showPopover"
            :popover-data="popoverData"
            :current-indicator="currentIndicator"
            :current-subgroup="currentSubgroup"
            popper-class="!z-10"
          )

          div(
            class="virtual-element absolute"
            ref="virtualElementRef"
            :style="coordinatesStyle"
            :id="String(popoverData?.country?.id)"
            :key="String(popoverData?.country?.id)"
          )

          MapboxAttributionControl(
            class="z-10 hide-popover-on-hover"
            :options="{ compact: true }"
            position="top-right"
          )

          MapboxNavigationControl(
            class="z-10 hide-popover-on-hover"
            :options="{ showCompass: false, visualizePitch: false }"
            position="bottom-right"
          )

          ElButton(
            class=`z-10 hide-popover-on-hover center-map-button absolute top-[10px] right-[10px] w-[29px] h-[29px]
              shadow-[0_0_0_1px_rgba(0,0,0,0.1)]
            `
            plain
            :icon="Aim"
            @click="onCenterMap"
          )

          MapLegend(
            class="z-10 hide-popover-on-hover absolute bottom-[20px] left-[20px]"
            :current-indicator="currentIndicator"
            :current-subgroup="currentSubgroup"
            :data-type="dataTypeFilterValue"
            :has-other="hasOther"
            :has-no-data="hasNoData"
            :nominal-legend="nominalLegend"
            :jenks-breaks="jenksBreaks"
          )

      p(class="text-sm text-secondary mt-4 mb-0")
        | The data used are the latest available as of 31/07/2025 that are less than 10 years old and from reliable international data repositories.
</template>

<script lang="ts" setup>
  import { Aim } from '@element-plus/icons-vue'

  defineOptions({ name: 'CountryComparisonMap' })

  definePageMeta({
    middleware: ['map-view']
  })

  const mapFiltersStore = useMapFiltersStore()
  const {
    dataTypeFilterValue,
    indicatorFilterValue,
    subgroupFilterValue,
    indicatorOptions,
    currentIndicator
  } = storeToRefs(mapFiltersStore)

  const {
    mapData,
    isFetching,
    linkedFeaturesSource,
    currentSubgroup,
    hasOther,
    hasNoData,
    nominalLegend,
    jenksBreaks
  } = useMapData()

  const { isInitializing } = useSyncRouteFilters({
    dataType: {
      ref: dataTypeFilterValue,
      validValues: ['numerical_categorical', 'laws_policies', 'targets']
    },
    indicator: {
      ref: indicatorFilterValue,
      validate: (val: string) =>
        indicatorOptions.value.some(domain =>
          domain.children?.some(indicator => indicator.id === val)
        ),
      waitForReady: () => indicatorOptions.value.length > 0
    },
    subgroup: {
      ref: subgroupFilterValue,
      validate: (val: string) =>
        currentIndicator.value?.subgroups?.some(
          subgroup => String(subgroup.id) === val
        ) ?? false,
      waitForReady: () => currentIndicator.value?.subgroups?.length > 0
    }
  })

  const { countriesPaint } = useMapStyles({
    dataTypeFilterValue,
    indicator: currentIndicator,
    subgroup: currentSubgroup,
    jenksBreaks,
    nominalLegend
  })

  const {
    mapOptions,
    countriesLayer,
    countriesHatchLayer,
    countriesBoundaryLayer
  } = useMapConfiguration(countriesPaint)

  const mapRef = useMapboxRef('world-map')

  const popover = useMapPopover(mapData, currentIndicator)

  const {
    showPopover,
    virtualElementRef,
    popoverData: _popoverData,
    coordinatesStyle,
    onGlobalMouseMove
  } = popover

  const popoverData = computed(() => _popoverData as Map.PopoverData)
  const isMapRefreshing = ref(false)
  let repaintTimeout: number | undefined
  let refreshToken = 0

  /**
   * Yield long enough for the browser to paint a frame (keeps v-loading alive).
   * requestAnimationFrame fires *before* the next paint, and the nested
   * setTimeout fires *after* that paint, so we're guaranteed the compositor
   * ran at least once between our JS chunks.
   */
  const yieldToBrowser = () =>
    new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0)
      })
    })

  const queueMapRepaint = (map: mapboxgl.Map) => {
    if (repaintTimeout) {
      window.clearTimeout(repaintTimeout)
    }

    repaintTimeout = window.setTimeout(() => {
      map.triggerRepaint()
      repaintTimeout = undefined
    }, 0)
  }

  const waitForMapIdle = (map: mapboxgl.Map, token: number) =>
    new Promise<void>(resolve => {
      let timeoutId: number | undefined

      const finalize = () => {
        map.off('idle', handleIdle)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        resolve()
      }

      const handleIdle = () => {
        finalize()
      }

      map.on('idle', handleIdle)
      queueMapRepaint(map)

      requestAnimationFrame(() => {
        if (
          token === refreshToken &&
          map.loaded() &&
          !map.isMoving() &&
          map.areTilesLoaded()
        ) {
          finalize()
        }
      })

      timeoutId = window.setTimeout(finalize, 1500)
    })

  watch(
    [isFetching, isInitializing, linkedFeaturesSource, countriesPaint],
    async () => {
      const map = mapRef.value
      const token = ++refreshToken

      if (isFetching.value || isInitializing.value) {
        isMapRefreshing.value = true
        return
      }

      if (!map) {
        isMapRefreshing.value = false
        return
      }

      isMapRefreshing.value = true
      await nextTick()
      await yieldToBrowser()
      await waitForMapIdle(map, token)

      if (token !== refreshToken) {
        return
      }

      isMapRefreshing.value = false
    },
    { flush: 'post' }
  )

  const { onCenterMap, onWheel, onMouseMove, onMouseLeave } = useMapEvents(
    mapRef,
    popover
  )

  onBeforeUnmount(() => {
    showPopover.value = false
    isMapRefreshing.value = false

    if (repaintTimeout) {
      clearTimeout(repaintTimeout)
    }
  })
</script>

<style lang="sass">
  .map-view
    .mapboxgl-ctrl-logo
      display: none !important

    .center-map-button
      border-color: rgb(229, 231, 235) !important

      &:hover
        border-color: rgb(229, 231, 235) !important
        background-color: #f2f2f2 !important
</style>

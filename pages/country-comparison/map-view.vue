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
          MapboxSource(
            source-id="who-country-labels"
            :source="countryLabelsSource"
          )
          MapboxSource(
            source-id="who-country-boundaries"
            :source="countryBoundariesSource"
          )
          MapboxSource(
            source-id="who-disputed-borders"
            :source="disputedBordersSource"
          )
          MapboxSource(
            source-id="who-disputed-areas"
            :source="disputedAreasSource"
          )

          //- Draw order matters and is asserted by tests/map-visual.spec.ts.
            WHO's disputed cartography goes above the choropleth so Western
            Sahara, Jammu and Kashmir and Abyei stay "Not applicable" whatever
            the indicator, and so the great lakes read as water.
          MapboxLayer(:layer="countriesHatchLayer" before-layer="countries")
          MapboxLayer(
            :layer="countriesLayer"
            @mousemove="onMouseMove"
            @mouseleave="onMouseLeave"
            before-layer="countries-boundary"
          )
          MapboxLayer(:layer="countriesBoundaryLayer" before-layer="disputed-areas-lakes")
          MapboxLayer(:layer="disputedAreaLakesLayer" before-layer="disputed-areas-not-applicable")
          MapboxLayer(:layer="disputedAreaNotApplicableLayer" before-layer="disputed-borders-dotted")
          MapboxLayer(
            v-for="layer in disputedAreaAksaiChinLayers"
            :key="layer.id"
            :layer="layer"
            before-layer="disputed-borders-dotted"
          )
          MapboxLayer(:layer="disputedBorderDottedLayer" before-layer="disputed-borders-kosovo")
          MapboxLayer(:layer="disputedBorderKosovoLayer" before-layer="disputed-borders-solid")
          MapboxLayer(:layer="disputedBorderSolidLayer" before-layer="disputed-borders-dashed-casing")
          MapboxLayer(:layer="disputedBorderDashedCasingLayer" before-layer="disputed-borders-dashed")
          MapboxLayer(:layer="disputedBorderDashedLayer" before-layer="country-names")
          MapboxLayer(:layer="countryNamesLayer")

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

          MapboxScaleControl(
            class="z-10 hide-popover-on-hover"
            :options="{ maxWidth: 120, unit: 'metric' }"
            position="top-left"
          )

          ElButton(
            class=`z-10 hide-popover-on-hover center-map-button absolute top-[20px] right-[20px] w-[29px] h-[29px]
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

      //- WHO map SOP 2.5 requires this disclaimer beneath the map, verbatim.
        Do not paraphrase or shorten it.
      .map-disclaimer(class="mt-4 flex items-start gap-4")
        img(
          src="@assets/images/WHO-Logo.png" alt="WHO Logo"
          class="h-[40px] object-contain shrink-0"
        )
        p(class="text-xs text-secondary m-0")
          | The designations employed and the presentation of the material in this publication do not imply the expression of any opinion whatsoever on the part of WHO concerning the legal status of any country, territory, city or area or of its authorities, or concerning the delimitation of its frontiers or boundaries. Dotted and dashed lines on maps represent approximate border lines for which there may not yet be full agreement.
          br
          | © WHO {{ copyrightYear }}. All rights reserved.
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

  const copyrightYear = new Date().getFullYear()

  const {
    mapData,
    isFetching,
    linkedFeaturesSource,
    countryLabelsSource,
    countryBoundariesSource,
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
    disputedBordersSource,
    disputedAreasSource,
    countriesLayer,
    countriesHatchLayer,
    countriesBoundaryLayer,
    disputedAreaLakesLayer,
    disputedAreaNotApplicableLayer,
    disputedAreaAksaiChinLayers,
    disputedBorderDottedLayer,
    disputedBorderKosovoLayer,
    disputedBorderSolidLayer,
    disputedBorderDashedCasingLayer,
    disputedBorderDashedLayer,
    countryNamesLayer
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

    // Mapbox insets its controls by 10px. Use 20px so they line up with
    // .map-view-legend and the recentre button against the map frame.
    .mapboxgl-ctrl-top-left .mapboxgl-ctrl
      margin: 20px 0 0 20px

    .mapboxgl-ctrl-top-right .mapboxgl-ctrl
      margin: 20px 20px 0 0

    .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl
      margin: 0 0 20px 20px

    .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl
      margin: 0 20px 20px 0

    .center-map-button
      border-color: rgb(229, 231, 235) !important

      &:hover
        border-color: rgb(229, 231, 235) !important
        background-color: #f2f2f2 !important
</style>

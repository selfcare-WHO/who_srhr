<template lang="pug">
  .map-view(
    class="relative min-h-[80vh] bg-page my-4 flex-1"
    @mousemove="onGlobalMouseMove"
    v-loading="isFetching"
  )
    MapDetailsPopover(
      v-model="showPopover"
      :popover-data="popoverData"
    )

    div(
      class="virtual-element absolute"
      ref="virtualElementRef"
      :style="coordinatesStyle"
      :id="String(popoverData?.country?.id)"
      :key="String(popoverData?.country?.id)"
    )

    MapboxMap(
      class="h-full min-h-[80vh] rounded-lg"
      map-id="world-map"
      :options="mapOptions"
      @wheel="onWheel"
      @drag="showPopover = false"
    )
      MapboxSource(
        source-id="who-world-basemap"
        :source="WHOWorldBasemapSource"
      )
      MapboxSource(
        source-id="who-world-features"
        :source="linkedFeaturesSource"
      )
      
      MapboxLayer(:layer="backgroundLayer")
      MapboxLayer(
        :layer="countriesLayer"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      )
      MapboxLayer(:layer="admin0Layer")
      MapboxLayer(:layer="disputedTerritoriesLayer")
      MapboxLayer(:layer="disputedBordersLayer")
      MapboxLayer(:layer="countryNamesLayer")

      MapboxAttributionControl(
        class="hide-popover-on-hover"
        :options="{ compact: true }"
        position="top-right"
      )

      MapboxNavigationControl(
        class="hide-popover-on-hover"
        :options="{ showCompass: false, visualizePitch: false }"
        position="bottom-right"
      )

      ElButton(
        class=`hide-popover-on-hover center-map-button absolute top-[10px] right-[10px] w-[29px] h-[29px]
          shadow-[0_0_0_1px_rgba(0,0,0,0.1)] z-10
        `
        plain
        :icon="Aim"
        @click="onCenterMap"
      )

    MapFilters(
      class="hide-popover-on-hover absolute top-[20px] left-[20px]"
    )

    MapLegend(
      class="hide-popover-on-hover absolute bottom-[20px] left-[20px]"
      :min-value="dataMinValue"
      :max-value="dataMaxValue"
      :current-indicator="currentIndicator"
      :data-type="dataTypeFilterValue"
      :nominal-legend="nominalLegend"
    )
</template>

<script lang="ts" setup>
  import { Aim } from '@element-plus/icons-vue'

  defineOptions({ name: 'CountryComparisonMap' })

  const {
    mapOptions,
    WHOWorldBasemapSource,
    backgroundLayer,
    admin0Layer,
    disputedTerritoriesLayer,
    disputedBordersLayer,
    countryNamesLayer
  } = useMapConfiguration()

  const {
    mapData,
    isFetching,
    nominalLegend,
    linkedFeaturesSource,
    dataMinValue,
    dataMaxValue,
    currentIndicator,
    dataTypeFilterValue
  } = useMapData()

  const { countriesPaint } = getCountriesPaint(
    dataTypeFilterValue,
    dataMinValue,
    dataMaxValue
  )

  const countriesLayer = computed<mapboxgl.LayerSpecification>(() => ({
    id: 'countries',
    type: 'fill',
    source: 'who-world-features',
    paint: {
      ...countriesPaint.value
    }
  }))

  const mapRef = useMapboxRef('world-map')

  const popover = useMapPopover(mapData, currentIndicator)

  const {
    showPopover,
    virtualElementRef,
    popoverData,
    coordinatesStyle,
    onGlobalMouseMove
  } = popover

  const { onCenterMap, onWheel, onMouseMove, onMouseLeave } = useMapEvents(
    mapRef,
    popover
  )

  onBeforeUnmount(() => {
    showPopover.value = false
    mapRef.value?.remove()
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

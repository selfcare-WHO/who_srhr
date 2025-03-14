<template lang="pug">
  .map-view(
    class=" min-h-[80vh] bg-page my-4 flex-1"
    @mousemove="onGlobalMouseMove"
  )
    MapFilters

    .map-container(class="relative h-full min-h-[80vh] w-full" v-loading="isFetching")
      MapboxMap(
        class="h-full min-h-[80vh] w-full rounded-lg"
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
        
        MapboxLayer(:layer="backgroundLayer" before-layer="countries")
        MapboxLayer(
          :layer="countriesLayer"
          @mousemove="onMouseMove"
          @mouseleave="onMouseLeave"
          before-layer="countries-boundary"
        )
        MapboxLayer(:layer="countriesBoundaryLayer" before-layer="admin-0")
        MapboxLayer(:layer="admin0Layer" before-layer="disputed-territories")
        MapboxLayer(:layer="disputedTerritoriesLayer" before-layer="disputed-borders")
        MapboxLayer(:layer="disputedBordersLayer" before-layer="country-names")
        MapboxLayer(:layer="countryNamesLayer")

        MapDetailsPopover(
          v-model="showPopover"
          :popover-data="popoverData"
          :current-indicator="currentIndicator"
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
          :min-value="dataMinValue"
          :max-value="dataMaxValue"
          :current-indicator="currentIndicator"
          :current-subgroup="currentSubgroup"
          :data-type="dataTypeFilterValue"
          :nominal-legend="nominalLegend"
          :has-other="hasOther"
          :has-no-data="hasNoData"
        )
</template>

<script lang="ts" setup>
  import { Aim } from '@element-plus/icons-vue'

  defineOptions({ name: 'CountryComparisonMap' })

  const {
    mapData,
    isFetching,
    nominalLegend,
    linkedFeaturesSource,
    dataMinValue,
    dataMaxValue,
    currentIndicator,
    currentSubgroup,
    dataTypeFilterValue,
    hasOther,
    hasNoData
  } = useMapData()

  const { countriesPaint } = useMapStyles({
    dataTypeFilterValue,
    dataMinValue,
    dataMaxValue,
    indicator: currentIndicator
  })

  const {
    mapOptions,
    WHOWorldBasemapSource,
    backgroundLayer,
    countriesLayer,
    countriesBoundaryLayer,
    admin0Layer,
    disputedTerritoriesLayer,
    disputedBordersLayer,
    countryNamesLayer
  } = useMapConfiguration(countriesPaint)

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

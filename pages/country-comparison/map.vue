<template lang="pug">
  .map-view(class="bg-page py-4 flex-1")
    MapboxMap(
      class="h-full relative min-h-[75vh] rounded-lg"
      map-id="world-map"
      :options="mapOptions"
      @wheel="() => {}"
      @drag="() => {}"
    )
      //- MapboxSource(
      //-   source-id="regions"
      //-   :source="{ type: 'geojson', data: linkedGeoJSON, promoteId: '@id' }"
      //- )

      //- MapboxLayer(
      //-   :layer="regionsLayer"
      //-   @mousemove="() => {}"
      //-   @mouseleave="() => {}"
      //-   @click="() => {}"
      //- )

      //- MapboxNavigationControl(
      //-   position="top-left"
      //-   :options="{ showCompass: false }"
      //- )

      //- div(
      //-   class="virtual-element absolute"
      //-   ref="virtualElementRef"
      //-   :style="coordinatesStyle"
      //-   :id="String(popoverData?.location?.id)"
      //-   :key="String(popoverData?.location?.id)"
      //- )
</template>

<script lang="ts" setup>
  defineOptions({ name: 'CountryComparisonMap' })

  import type { MapboxComponentOptions } from 'nuxt-mapbox'

  const mapOptions = computed<MapboxComponentOptions>(() => ({
    style: 'mapbox://styles/mapbox/light-v11',
    maxZoom: 8.5,
    // minZoom: isMobile.value ? 5.5 : 6,
    // scrollZoom: false,
    projection: 'naturalEarth',
    attributionControl: false
  }))
</script>

<style lang="sass" scoped></style>

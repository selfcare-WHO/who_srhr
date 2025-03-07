export const useMapPopover = (
  mapData: Ref<Map.DataPoints | null>,
  currentIndicator: Ref<any>
) => {
  const showPopover = ref(false)
  const hoveredFeatureId = ref<string | number>('')
  const virtualElementRef = ref<HTMLElement | undefined>()
  const popoverData = reactive<Map.PopoverData>({})
  const popoverCoordinates = ref<mapboxgl.Point | undefined>()

  const coordinatesStyle = computed(() =>
    popoverCoordinates.value
      ? {
          left: `${popoverCoordinates.value.x}px`,
          top: `${popoverCoordinates.value.y}px`
        }
      : {}
  )

  const hidePopover = () => {
    showPopover.value = false
  }

  const onGlobalMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    if (
      target?.classList?.contains('hide-popover-on-hover') &&
      showPopover.value
    ) {
      showPopover.value = false
      return
    }
  }

  const updatePopoverData = (feature: any, map: mapboxgl.Map) => {
    const featureId = feature?.id

    // Skip if no feature
    if (!featureId) return

    map.setFeatureState(
      { source: 'who-world-features', id: hoveredFeatureId.value },
      { hover: false }
    )

    map.setFeatureState(
      {
        source: 'who-world-features',
        id: featureId
      },
      { hover: true }
    )

    hoveredFeatureId.value = feature?.id || ''
    map.getCanvas().style.cursor = 'pointer'

    const { dataPointId, CENTER_LAT, CENTER_LON } = feature.properties as {
      dataPointId: string
      CENTER_LAT: number
      CENTER_LON: number
    }

    const dataPoint = mapData.value?.dataPoints.find(
      dp => dp.id.toString() === dataPointId
    )

    popoverData.lngLat = [CENTER_LON, CENTER_LAT]
    popoverData.country = feature.properties?.ADM0_VIZ_NAME
    popoverData.value = formatData({
      indicator: currentIndicator.value,
      dataPoint
    })
    popoverData.element = undefined

    nextTick(() => {
      popoverData.element = virtualElementRef.value

      // Calculate point position
      const point = map.project([CENTER_LON, CENTER_LAT])

      // Get map dimensions
      const mapCanvas = map.getCanvas()
      const mapWidth = mapCanvas.width
      const mapHeight = mapCanvas.height

      // Adjust coordinates to ensure popover stays within map bounds
      const popoverWidth = 230
      const popoverHeight = 100
      const popoverOffset = 10

      // Adjust x coordinate if too close to the right edge
      if (point.x + popoverWidth / 2 > mapWidth) {
        point.x = mapWidth - popoverWidth / 2
      }
      // Adjust x coordinate if too close to the left edge
      else if (point.x - popoverWidth / 2 < 0) {
        point.x = popoverWidth / 2
      }

      // Adjust y coordinate if too close to the top edge
      if (point.y - popoverHeight - popoverOffset < 0) {
        point.y = popoverHeight + popoverOffset
      }

      popoverCoordinates.value = point
      showPopover.value = true
    })
  }

  return {
    showPopover,
    hoveredFeatureId,
    virtualElementRef,
    popoverData,
    coordinatesStyle,
    hidePopover,
    onGlobalMouseMove,
    updatePopoverData
  }
}

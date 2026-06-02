export const useMapPopover = (
  mapData: Ref<Map.DataPoints | null>,
  currentIndicator: Ref<any>
) => {
  const showPopover = ref(false)
  const hoveredFeatureId = ref<string | number>('')
  const virtualElementRef = ref<HTMLElement | undefined>()
  const popoverData = reactive({} as Map.PopoverData)
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

    if (!featureId) return

    map.setFeatureState(
      { source: 'who-world-features', id: hoveredFeatureId.value },
      { hover: false }
    )

    // Territories absent from the dataset (e.g. Western Sahara) have no
    // dataPointId — give them no hover tooltip, highlight, or pointer cursor.
    if (!feature.properties?.dataPointId) {
      hoveredFeatureId.value = featureId
      showPopover.value = false
      map.getCanvas().style.cursor = ''
      return
    }

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
    popoverData.source = dataPoint?.source ?? undefined
    popoverData.currentYearSource = dataPoint?.currentYearSource ?? undefined

    nextTick(() => {
      popoverData.element = virtualElementRef.value

      const point = map.project([CENTER_LON, CENTER_LAT])

      const mapCanvas = map.getCanvas()
      const mapWidth = mapCanvas.width
      const mapHeight = mapCanvas.height

      const popoverWidth = 230
      const popoverOffset = 10

      const isInUpperFifth = point.y < mapHeight / 5
      const isInLeftFifth = point.x < mapWidth / 5
      const isInRightFifth = point.x > mapWidth - mapWidth / 5

      popoverData.placement = (() => {
        if (isInUpperFifth) return 'bottom'
        if (isInLeftFifth) return 'right'
        if (isInRightFifth) return 'left'

        return 'top'
      })()

      if (point.x < 0) {
        point.x = popoverOffset
      }

      if (point.x > mapWidth - popoverOffset) {
        point.x = mapWidth - popoverOffset
      }

      if (point.y < 0) {
        point.y = popoverOffset
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

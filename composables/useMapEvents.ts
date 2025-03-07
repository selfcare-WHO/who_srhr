export const useMapEvents = (
  mapRef: Ref<any>,
  popover: ReturnType<typeof useMapPopover>
) => {
  const onCenterMap = () => {
    mapRef.value?.flyTo({
      center: [20, 20],
      zoom: 1.5
    })
  }

  const onWheel = (e: mapboxgl.MapWheelEvent) => {
    const map = e.target
    const { deltaY } = e.originalEvent
    const currentZoom = map.getZoom()

    if (!currentZoom) return

    const newZoom = currentZoom - deltaY / 120

    popover.showPopover.value = false
    map.flyTo({ zoom: newZoom })
  }

  const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
    const map = e.target
    const feature = e.features?.[0]
    const featureId = feature?.id
    const { length } = e?.features ?? []
    const isSameFeature = featureId === popover.hoveredFeatureId.value

    if (length === 0 || !featureId || isSameFeature) return

    popover.updatePopoverData(feature, map)
  }

  const onMouseLeave = (e: mapboxgl.MapMouseEvent) => {
    const map = e.target
    const features = map.queryRenderedFeatures(e.point)

    if (features.some(f => f.layer?.id === 'countries')) return

    map.setFeatureState(
      { source: 'who-world-features', id: popover.hoveredFeatureId.value },
      { hover: false }
    )

    popover.hoveredFeatureId.value = ''
    map.getCanvas().style.cursor = ''
    popover.showPopover.value = false
  }

  return {
    onCenterMap,
    onWheel,
    onMouseMove,
    onMouseLeave
  }
}

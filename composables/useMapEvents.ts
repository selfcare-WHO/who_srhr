/**
 * WHO's "Not applicable" areas (Jammu and Kashmir, Western Sahara, Abyei) and
 * the Aksai Chin hatch sit over member-state polygons. They belong to no one
 * country, so hovering them must not surface India's, Pakistan's or China's
 * tooltip.
 */
const NO_TOOLTIP_CLASSES = ['notApplicable', 'aksaiChin']

const isOverNoTooltipArea = (map: mapboxgl.Map, point: mapboxgl.Point) =>
  map
    .queryRenderedFeatures(point)
    .some(
      f =>
        f.source === 'who-disputed-areas' &&
        NO_TOOLTIP_CLASSES.includes(f.properties?.symbolClass)
    )

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

    if (length === 0 || !featureId) return

    if (isOverNoTooltipArea(map, e.point)) {
      clearHover(map)
      return
    }

    if (isSameFeature) return

    popover.updatePopoverData(feature, map)
  }

  const onMouseLeave = (e: mapboxgl.MapMouseEvent) => {
    const map = e.target
    const features = map.queryRenderedFeatures(e.point)

    if (features.some(f => f.layer?.id === 'countries')) return

    clearHover(map)
  }

  const clearHover = (map: mapboxgl.Map) => {
    if (popover.hoveredFeatureId.value) {
      map.setFeatureState(
        { source: 'who-world-features', id: popover.hoveredFeatureId.value },
        { hover: false }
      )
    }

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

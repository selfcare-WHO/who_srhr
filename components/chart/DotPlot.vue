<script setup lang="ts">
  import * as d3 from 'd3'

  const props = defineProps<{
    data: Chart.Data
  }>()

  const filtersStore = useFiltersStore()
  const { indicators } = storeToRefs(filtersStore)

  const currentIndicator = computed<
    Prisma.SerializedIndicatorWithSubgroups | undefined
  >(() => {
    return indicators.value.find(
      indicator => indicator.id === props.data.indicatorId
    )
  })

  const popoverValue = computed(() => {
    return formatData({
      indicator: currentIndicator.value,
      value: popover.value
    })
  })

  const chartContainer = ref<HTMLElement | null>(null)
  const chartWidth = ref(0)
  const dotRadius = 12
  const colorsCssVars = {
    highlighted: '#00205ccc',
    highlightedhover: '#00205cff',
    regular: '#8dc5ff99',
    regularhover: '#3299ffcc',
    target: '#00205c'
  }

  type CircleData = {
    x: number
    y: number
    dataPoint: Chart.DataPoint
    element: SVGCircleElement
  }
  const circlesData = ref<CircleData[]>([])

  onMounted(() => {
    updateChartSize()
    window.addEventListener('resize', updateChartSize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateChartSize)
  })

  const updateChartSize = () => {
    if (chartContainer.value) {
      chartWidth.value = chartContainer.value.clientWidth
      renderChart()
    }
  }

  const resetCircles = () => {
    d3.selectAll('.data-circle').classed('-hovered', false)
  }

  const showTooltipForDataPoint = (
    element: SVGCircleElement,
    dataPoint: Chart.DataPoint
  ) => {
    resetCircles()

    d3.select(element).raise()
    popover.show = true
    popover.country = dataPoint.countryName
    popover.value = dataPoint.value
    popover.id = dataPoint.countryId
    popover.element = element
    d3.select(element).classed('-hovered', true)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!chartContainer.value || circlesData.value.length === 0) return

    const svgRect = chartContainer.value
      .querySelector('svg')
      ?.getBoundingClientRect()
    if (!svgRect) return

    const mouseX = event.clientX - svgRect.left
    const mouseY = event.clientY - svgRect.top

    let closestCircle: CircleData | null = null
    let minDistance = dotRadius

    circlesData.value.forEach(circle => {
      const distance = Math.sqrt(
        Math.pow(mouseX - circle.x, 2) + Math.pow(mouseY - circle.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        closestCircle = circle
      }
    })

    const maxHighlightDistance = dotRadius * 2

    if (closestCircle && minDistance <= maxHighlightDistance) {
      const circle = closestCircle as CircleData
      showTooltipForDataPoint(circle.element, circle.dataPoint)
    } else {
      resetCircles()
      popover.show = false
    }
  }

  const renderChart = () => {
    if (!chartContainer.value) return

    const width = chartWidth.value
    const height = 60

    d3.select(chartContainer.value).selectAll('*').remove()

    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', chartWidth.value)
      .attr('height', height)
      .attr('overflow', 'visible')
      .append('g')
      .attr('class', 'chart-container')
      .attr(
        'style',
        Object.entries(colorsCssVars)
          .map(([key, value]) => `--${key}: ${value}`)
          .join(';')
      )

    d3.select(chartContainer.value)
      .select('svg')
      .on('mousemove', useThrottleFn(handleMouseMove, 100))
      .on('mouseleave', () => {
        resetCircles()
        popover.show = false
      })

    const xScale = d3
      .scaleLinear()
      .domain([props.data.minValue, props.data.maxValue])
      .range([0, width])

    const axis = d3
      .axisBottom(xScale)
      .ticks(2)
      .tickValues([props.data.minValue, props.data.maxValue])
      .tickFormat(d =>
        formatLargeNumbers(d.valueOf(), 1, currentIndicator.value)
      )
      .tickPadding(10)

    const axisG = svg
      .append('g')
      .attr('transform', `translate(0,${height / 2})`)
      .call(axis)

    axisG.selectAll('.tick line').attr('transform', 'translate(0, -7)')

    circlesData.value = []

    svg
      .selectAll('circle')
      .data(props.data.dataPoints)
      .enter()
      .append('circle')
      .attr('class', 'data-circle')
      .attr('cx', (d: Chart.DataPoint) => xScale(Number(d.value)))
      .attr('cy', height / 2)
      .attr('r', dotRadius)
      .attr('class', (d: Chart.DataPoint) =>
        d.isHighlighted ? 'data-circle -highlighted' : 'data-circle'
      )
      .attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .attr('style', 'transition: fill 0.2s ease-in-out, r 0.2s ease-in-out')
      .each(function (d: Chart.DataPoint) {
        const element = this as SVGCircleElement
        const x = xScale(Number(d.value))
        const y = height / 2

        circlesData.value.push({
          x,
          y,
          dataPoint: d,
          element
        })
      })

    d3.selectAll('.data-circle.-highlighted').each(function () {
      const element = this as SVGCircleElement
      d3.select(element).raise()
    })
  }

  watchDeep(() => props.data, renderChart)
  watch(() => chartWidth.value, renderChart)

  const popover = reactive<{
    show: boolean
    element: EventTarget | null
    id: string
    country: string
    value?: string
  }>({
    show: false,
    element: null,
    id: '',
    country: '',
    value: ''
  })
</script>

<template lang="pug">
.dot-plot-chart(class="w-full mb-4")
  h2(class="font-bold text-xl") {{ data.indicatorName }}
  h3(class="text-sm") {{ data.subheading }}
  h4(v-if="data.subgroupName && data.subgroupName !== 'Data'" class="text-sm text-gray-600") {{ data.subgroupName }}

  div(ref="chartContainer")

  ElPopover(
    popper-class="data-popover pointer-events-none"
    placement="top"
    virtual-triggering
    :width="230"
    :persistent="false"
    :teleported="false"
    :visible="popover.show"
    :virtual-ref="popover.element"
    :key="popover.id"
  )
    .flex.flex-col.gap-2
      h3(class="text-[20px] leading-tight font-bold") {{ popover.country }}
      span.text-md {{ popoverValue }}
</template>

<style lang="sass">
  .dot-plot-chart
    .chart-container
      .data-circle
        fill: var(--regular)

        &.-hovered
          fill: var(--regularhover)
          r: 14

        &.-highlighted
          fill: var(--highlighted)

          &.-hovered
            fill: var(--highlightedhover)
</style>

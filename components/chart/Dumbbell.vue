<script setup lang="ts">
  import * as d3 from 'd3'

  // Define the type for chart data points
  type DataPoint = {
    value: number
    isHighlighted: boolean
    label?: string
  }

  const props = defineProps<{
    data: Chart.Data
  }>()

  const chartContainer = ref<HTMLElement | null>(null)
  const chartWidth = ref(0)

  // Chart configurations
  const margin = { top: 20, right: 20, bottom: 20, left: 120 }
  const dotRadius = 6
  const colors = {
    highlighted: '#193f77',
    regular: '#a4cef8',
    target: '#000'
  }

  // Resize handling
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

  // Chart rendering
  const renderChart = () => {
    if (!chartContainer.value) return

    const width = chartWidth.value - margin.left - margin.right
    const height = 80 // Fixed height for each chart

    // Clear previous chart
    d3.select(chartContainer.value).selectAll('*').remove()

    // Create SVG
    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', chartWidth.value)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scale
    const xScale = d3
      .scaleLinear()
      .domain([props.data.minValue, props.data.maxValue])
      .range([0, width])

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5))

    // Add range label at bottom
    svg
      .append('text')
      .attr('x', 0)
      .attr('y', height - 5)
      .text(props.data.minValue)
      .attr('font-size', '12px')
      .attr('text-anchor', 'start')

    svg
      .append('text')
      .attr('x', width)
      .attr('y', height - 5)
      .text(props.data.maxValue)
      .attr('font-size', '12px')
      .attr('text-anchor', 'end')

    // Add axis line
    svg
      .append('line')
      .attr('x1', 0)
      .attr('y1', height / 2)
      .attr('x2', width)
      .attr('y2', height / 2)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1)

    // Add dots for each country
    svg
      .selectAll('circle')
      .data(props.data.dataPoints)
      .enter()
      .append('circle')
      .attr('cx', (d: DataPoint) => xScale(d.value))
      .attr('cy', height / 2)
      .attr('r', (d: DataPoint) =>
        d.isHighlighted ? dotRadius : dotRadius - 2
      )
      .attr('fill', (d: DataPoint) =>
        d.isHighlighted ? colors.highlighted : colors.regular
      )
      .attr('stroke', (d: DataPoint) => (d.isHighlighted ? 'none' : '#fff'))
      .attr('stroke-width', 1)

    svg
      .append('text')
      .attr('x', -margin.left)
      .attr('y', height / 2 - 15)
      .text(props.data.name)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
  }

  // Watch for data changes to update chart
  watch(() => props.data, renderChart, { deep: true })
  watch(() => chartWidth.value, renderChart)
</script>

<template lang="pug">
.dumbbell-chart(ref="chartContainer")
</template>

<style lang="scss" scoped>
  .dumbbell-chart {
    width: 100%;
    margin-bottom: 16px;
  }
</style>

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

  const dotRadius = 12
  const colors = {
    highlighted: '#00205c',
    regular: '#8dc5ff99',
    target: '#00205c'
  }

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

  const renderChart = () => {
    if (!chartContainer.value) return

    const width = chartWidth.value
    const height = 60

    // Clear previous chart
    d3.select(chartContainer.value).selectAll('*').remove()

    const svg = d3
      .select(chartContainer.value)
      .append('svg')
      .attr('width', chartWidth.value)
      .attr('height', height)
      .attr('overflow', 'visible')
      .append('g')

    const xScale = d3
      .scaleLinear()
      .domain([props.data.minValue, props.data.maxValue])
      .range([0, width])

    const axis = d3
      .axisBottom(xScale)
      .ticks(2)
      .tickValues([props.data.minValue, props.data.maxValue])
      .tickFormat(d => formatLargeNumbers(d.valueOf(), 1))

    const axisG = svg
      .append('g')
      .attr('transform', `translate(0,${height / 2})`)
      .call(axis)

    axisG.selectAll('.tick line').attr('transform', 'translate(0, -7)')

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
      .attr('opa', colors.target)
      .attr('stroke-width', 1)
  }

  watchDeep(() => props.data, renderChart)
  watch(() => chartWidth.value, renderChart)
</script>

<template lang="pug">
.dumbbell-chart
  h2(class="font-bold text-xl") {{ data.indicatorName }}
  h3(class="text-sm") {{ data.subheading }}
  h4(v-if="data.subgroupName && data.subgroupName !== 'Data'" class="text-sm text-gray-600") {{ data.subgroupName }}

  div(ref="chartContainer")
</template>

<style lang="scss" scoped>
  .dumbbell-chart {
    width: 100%;
    margin-bottom: 16px;
  }
</style>

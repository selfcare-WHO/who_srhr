<template lang="pug">
  .map-view-legend(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    .mb-3
      p(class="m-0 text-[17px] font-[700] text-primary")
        | {{ currentIndicator?.fullName }}

      p(v-if="currentIndicator?.subheading" class="m-0 text-sm text-regular")
        | {{ currentIndicator?.subheading }}

      p(
        v-if="currentSubgroup && currentSubgroup.name !== 'Data'"
        class="m-0 text-sm text-bold"
      )
        | {{ currentSubgroup?.fullName }}

    template(v-if="isNominal || dataType === 'targets'")
      h3(class="mt-2 font-bold text-sm text-regular uppercase")
        | {{ legendTitle }}

      div(class="mt-2 grid grid-cols-2 gap-2")
        div(
          v-for="(status, key) in legendItems"
          :key="key"
          class="flex items-center gap-2"
        )
          div(
            v-if="status?.hatchPattern"
            class="h-4 w-6 min-h-4 min-w-6 border-2 flex items-center justify-center"
            :style="{ background: `url(${hatchUri}) repeat`, backgroundSize: '6px' }"
          )

          div(
            v-else-if="status?.solidColor"
            class="rounded-full h-4 w-4 min-h-4 min-w-4 flex items-center justify-center"
            :style="{ backgroundColor: status?.solidColor }"
          )

          div(
            v-else
            class="rounded-full h-4 w-4 min-h-4 min-w-4 border-2 flex items-center justify-center"
            :style="itemStyle(status)"
          )
            ElIcon(
              v-if="status?.icon"
              :color="status?.iconColor"
              size="10"
            )
              component(:is="status?.icon")

          span(class="text-sm text-regular")
            | {{ status?.name }}

    template(v-else)
      div(class="mt-2 h-3 w-[calc(100%-2rem)] mx-4 flex")
        div(
          v-for="(_, index) in gradientQtd"
          class="flex-1"
          :key="index"
          :style="{ backgroundColor: gradientColor(index) }"
        )

      div(class="relative mt-2 h-3 w-[calc(100%-2rem)] mx-4")
        span(
          v-for="(value, index) in jenksBreaks"
          :key="index"
          class="text-xs text-regular absolute"
          :style="scaleStyle(index)"
        )
          | {{ formatLargeNumbers(value, 2, currentIndicator) }}

      div(class="mx-3 mt-5 grid grid-cols-2 gap-2")
        div(
          v-for="(legendItem, key) in heatmapLegendItems"
          :key="key"
          class="flex items-center gap-2"
        )
          div(
            v-if="legendItem?.hatchPattern"
            class="h-4 w-6 min-h-4 min-w-6 border-2"
            :style="{ background: `url(${hatchUri}) repeat`, backgroundSize: '6px' }"
          )

          div(
            v-else
            class="rounded-full h-4 w-4 min-h-4 min-w-4"
            :style="{ backgroundColor: legendItem?.color }"
          )

          span(class="text-sm text-regular")
            | {{ legendItem?.name }}

</template>

<script lang="ts" setup>
  const { hatchUri } = useHatchPattern()

  const props = defineProps<{
    currentIndicator?: Prisma.IndicatorWithSubgroups
    currentSubgroup?: Prisma.Subgroup
    dataType: Filter.DataType
    hasOther?: boolean
    hasNoData?: boolean
    nominalLegend?: Data.Legend
    jenksBreaks?: number[]
  }>()

  const { targetStatus, impactOnSrhr } = useEnum()

  const isNominal = computed(() => props.currentIndicator?.type === 'Nominal')

  const isInvertScale = computed(() => {
    console.log(
      '🚀 ~: isInvertScale -> props.currentSubgroup?.invertScale',
      props.currentSubgroup?.invertScale
    )
    return props.currentSubgroup?.invertScale ?? false
  })

  const gradientQtd = computed(() => {
    const breaksLen = props.jenksBreaks?.length ?? 0

    if (breaksLen <= 1) return Array.from({ length: 1 })

    return Array.from({ length: breaksLen - 1 })
  })

  const gradientColor = (index: number) => {
    const total = gradientQtd.value.length
    if (total <= 1 || !isInvertScale.value)
      return `var(--el-bg-color-jenks-${index})`

    const invertedIndex = total - 1 - index
    return `var(--el-bg-color-jenks-${invertedIndex})`
  }

  const legendItems = computed(() => {
    if (props.dataType === 'numerical_categorical')
      return isNominal.value ? (props.nominalLegend ?? {}) : targetStatus
    if (props.dataType === 'laws_policies') return impactOnSrhr
    if (props.dataType === 'targets') return targetStatus

    return {}
  })

  const legendTitle = computed(() => {
    if (props.dataType === 'numerical_categorical') return 'Legend:'
    if (props.dataType === 'laws_policies') return 'Impact on integrated srhr:'
    if (props.dataType === 'targets') return 'Global target status:'
    return ''
  })

  const heatmapLegendItems = computed<Record<string, Map.Legend>>(() => {
    return {
      ...(props.hasOther
        ? {
            Other: {
              name: 'Other',
              color: 'var(--el-color-warning)'
            }
          }
        : {}),
      ...(props.hasNoData
        ? {
            'No data': {
              name: 'No data',
              hatchPattern: true
            }
          }
        : {})
    }
  })

  const scaleStyle = (index: number) => {
    const valuesInterval = props.jenksBreaks?.length ?? 0

    if (valuesInterval <= 1) {
      return {
        left: '50%',
        right: 'auto',
        textAlign: 'center' as const,
        transform: 'translateX(-50%)'
      }
    }

    if (index === 0) {
      return {
        left: `${index * (100 / (valuesInterval - 1))}%`,
        right: 'auto',
        textAlign: 'left' as const,
        transform: 'translateX(-50%)'
      }
    } else if (index === valuesInterval - 1) {
      return {
        right: `${(valuesInterval - 1 - index) * (100 / (valuesInterval - 1))}%`,
        left: 'auto',
        textAlign: 'right' as const,
        transform: 'translateX(50%)'
      }
    } else {
      return {
        left: `${index * (100 / (valuesInterval - 1))}%`,
        right: 'auto',
        textAlign: 'center' as const,
        transform: 'translateX(-50%)'
      }
    }
  }

  const itemStyle = (status: Data.Legend[keyof Data.Legend]) => {
    return {
      backgroundColor: status?.color ?? status.bgColor,
      borderColor: status?.color ?? status.borderColor
    }
  }
</script>

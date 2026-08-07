<template lang="pug">
  .map-view-legend(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    .mb-3.flex.flex-col
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
            :style="hatchSwatchStyle"
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

        //- WHO map SOP 2.4 — see notApplicableStyle. Sits inside the grid so it
          lines up with the other keys.
        div(class="flex items-center gap-2")
          div(
            class="h-4 w-6 min-h-4 min-w-6 border-2"
            :style="notApplicableStyle"
          )
          span(class="text-sm text-regular") Not applicable

    template(v-else)
      div(class="mt-2 h-3 w-[calc(100%-2rem)] mx-4 flex")
        ElTooltip(
          v-for="(_, index) in gradientQtd"
          :key="index"
          :content="breakRange(index)"
          placement="top"
        )
          div(
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
            :style="hatchSwatchStyle"
          )

          div(
            v-else
            class="rounded-full h-4 w-4 min-h-4 min-w-4"
            :style="{ backgroundColor: legendItem?.color }"
          )

          span(class="text-sm text-regular")
            | {{ legendItem?.name }}

        //- WHO map SOP 2.4 — see notApplicableStyle. Sits inside the grid so it
          lines up with the other keys.
        div(class="flex items-center gap-2")
          div(
            class="h-4 w-6 min-h-4 min-w-6 border-2"
            :style="notApplicableStyle"
          )
          span(class="text-sm text-regular") Not applicable

    p(
      v-if="currentIndicator?.endnote"
      class="text-xs mb-0 text-secondary"
      :style="{ overflowWrap: 'anywhere' }"
    )
      | Source:&nbsp;
      template(v-for="(part, index) in endnoteParts" :key="index")
        a(
          v-if="part.type === 'link'"
          :href="part.url"
          target="_blank"
          rel="noopener noreferrer"
          class="underline text-xs"
        ) {{ part.content }}
        span(v-else class="text-xs") {{ part.content }}

</template>

<script lang="ts" setup>
  import { linkifyText } from '~/utils/linkifyText'

  const { hatchUri } = useHatchPattern()

  /**
   * Swatches sit on the legend's tinted panel, where the fills they stand for
   * are near-invisible unaided: WHO's disputed-area grey is a shade off the
   * panel, and the hatch SVG is transparent so the panel shows through it.
   * A dark outline plus a white base makes each swatch read as the map does.
   */
  const SWATCH_BORDER = '#606266'

  /** WHO's DISPUTED_AREAS fill for the "not applicable" territories (SOP 2.4). */
  const notApplicableStyle = {
    backgroundColor: '#E1E1E1',
    borderColor: SWATCH_BORDER
  }

  /**
   * Longhand, not the `background` shorthand — the shorthand would reset the
   * white base to transparent. Tiled at the SVG's own 10px so the strokes stay
   * a full pixel wide; scaling down to 6px rendered them at 0.6px and they
   * washed out.
   */
  const hatchSwatchStyle = {
    backgroundColor: '#ffffff',
    backgroundImage: `url(${hatchUri})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '10px',
    borderColor: SWATCH_BORDER
  }

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
    return props.currentSubgroup?.invertScale ?? false
  })

  const endnoteParts = computed(() => {
    if (!props.currentIndicator?.endnote) return []
    return linkifyText(props.currentIndicator.endnote)
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

  const breakRange = (index: number) => {
    const breaks = props.jenksBreaks ?? []
    if (breaks.length === 0) return ''

    const lower = breaks[index]
    const upper = breaks[index + 1]

    if (upper === undefined) {
      return `≥ ${formatLargeNumbers(lower, 2, props.currentIndicator)}`
    }

    return `>${formatLargeNumbers(lower, 2, props.currentIndicator)} to ≤${formatLargeNumbers(
      upper,
      2,
      props.currentIndicator
    )}`
  }
</script>

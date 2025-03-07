<template lang="pug">
  div(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    .mb-3
      span(class="text-[17px] font-[700] text-primary")
        | {{ currentIndicator?.fullName }}

      span(v-if="currentIndicator?.subheading" class="text-sm text-regular")
        | {{' '}} ({{ currentIndicator?.subheading }})

    template(v-if="dataType !== 'heatmap' && Object.keys(legendItems).length > 0")
      h3(class="mt-2 font-bold text-sm text-regular uppercase")
        | {{ dataType === 'nominal' ? 'Legend:' : 'Global target status:' }}

      div(class="mt-2 grid grid-cols-2 gap-y-2")
        div(
          v-for="(status, key) in legendItems"
          :key="key"
          class="flex items-center gap-2"
        )
          div(
            class="h-4 w-4 rounded-full"
            :style="{ backgroundColor: status.color }"
          )

          span(class="text-sm text-regular")
            | {{ status.value }}

    template(v-else)
      div(class=`
        mt-2 h-3 w-[calc(100%-2rem)] mx-4
        bg-gradient-to-r
        from-[var(--el-bg-color-heatmap-min)]
        to-[var(--el-bg-color-heatmap-max)]
      `)
      
      div(class="relative mt-2 h-3 w-[calc(100%-2rem)] mx-4")
          span(
            v-for="(value, index) in gradientValues" :key="index"
            class="text-xs text-regular absolute"
            :style="scaleStyle(index)"
          )
            | {{ formatData({ indicator: currentIndicator, value }) }}

</template>

<script lang="ts" setup>
  import { TargetStatus } from '~/types/enums'

  const props = defineProps<{
    minValue: number
    maxValue: number
    currentIndicator?: Prisma.IndicatorWithSubgroups
    dataType: Filter.MapDataType
    nominalLegend?: Map.Legend
  }>()

  const valuesInterval = 5

  const gradientValues = computed(() => {
    const range = props.maxValue - props.minValue

    return Array.from({ length: valuesInterval }, (_, i) => {
      return props.minValue + (range * i) / valuesInterval
    })
  })

  const isNominal = computed(() => props.dataType === 'nominal')
  const legendItems = computed(() =>
    isNominal.value ? (props.nominalLegend ?? {}) : TargetStatus
  )

  const scaleStyle = (index: number) => {
    const middleIndex = Math.floor(valuesInterval / 2)

    if (index < middleIndex) {
      return {
        left: `${index * (100 / (valuesInterval - 1))}%`,
        right: 'auto',
        textAlign: 'left' as const,
        transform: 'translateX(-50%)'
      }
    } else if (index > middleIndex) {
      return {
        right: `${(valuesInterval - 1 - index) * (100 / (valuesInterval - 1))}%`,
        left: 'auto',
        textAlign: 'right' as const,
        transform: 'translateX(50%)'
      }
    } else {
      return {
        left: '50%',
        right: 'auto',
        textAlign: 'center' as const,
        transform: 'translateX(-50%)'
      }
    }
  }
</script>

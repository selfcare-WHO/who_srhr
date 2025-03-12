<template lang="pug">
  div(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    .mb-3
      p(class="m-0 text-[17px] font-[700] text-primary")
        | {{ currentIndicator?.fullName }}

      p(v-if="currentIndicator?.subheading" class="m-0 text-sm text-regular")
        | {{ currentIndicator?.subheading }}

      p(
        v-if="currentSubgroup && currentSubgroup.name !== 'Data'"
        class="m-0 text-sm text-bold"
      )
        | {{ currentSubgroup?.name }}

    template(v-if="isNominal || dataType === 'targets'")
      h3(class="mt-2 font-bold text-sm text-regular uppercase")
        | {{ legendTitle }}

      div(class="mt-2 grid grid-cols-2 gap-y-2")
        div(
          v-for="(status, key) in legendItems"
          :key="key"
          class="flex items-center gap-2"
        )
          div(
            class="rounded-full h-4 w-4 border-2 flex items-center justify-center"
            :style="itemStyle(status)"
          )
            ElIcon(
              v-if="status.icon"
              :color="status.iconColor"
              size="10"
            )
              component(:is="status.icon")

          span(class="text-sm text-regular")
            | {{ status.name }}

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
  import { ImpactOnSrhr } from '~/types/clientEnums'

  const props = defineProps<{
    minValue: number
    maxValue: number
    currentIndicator?: Prisma.IndicatorWithSubgroups
    currentSubgroup?: Prisma.Subgroup
    dataType: Filter.DataType
    nominalLegend?: Data.Legend
  }>()

  const valuesInterval = 5

  const gradientValues = computed(() => {
    const range = props.maxValue - props.minValue

    return Array.from({ length: valuesInterval }, (_, i) => {
      return props.minValue + (range * i) / valuesInterval
    })
  })

  const isNominal = computed(() => props.currentIndicator?.type === 'Nominal')

  const legendItems = computed(() => {
    if (props.dataType === 'laws_policies') return ImpactOnSrhr
    if (props.dataType === 'targets') return TargetStatus
    if (isNominal.value) return props.nominalLegend ?? {}

    return {}
  })

  const legendTitle = computed(() => {
    if (props.dataType === 'numerical_categorical') return 'Legend:'
    if (props.dataType === 'laws_policies') return 'Impact on integrated srhr:'
    if (props.dataType === 'targets') return 'Global target status:'
    return ''
  })

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

  const itemStyle = (status: Data.Legend[keyof Data.Legend]) => {
    return {
      backgroundColor: status?.color ?? status.bgColor,
      borderColor: status?.color ?? status.borderColor
    }
  }
</script>

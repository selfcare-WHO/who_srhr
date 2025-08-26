<template lang="pug">
  ElPopover(
    :visible="showPopover"
    :virtual-ref="popoverData?.element"
    :width="230"
    :virtual-triggering="true"
    :key="popoverData?.element?.id"
    :persistent="false"
    :placement="popoverData?.placement ?? 'top'"
    :teleported="false"
    :popper-class="`data-popover pointer-events-none ${popperClass}`"
  )
    .flex.flex-col
      h3(class="text-[20px] leading-tight font-bold") {{ popoverData.country }}
      h4(class="text-md mt-2")
        | {{ currentIndicator.displayName }}
      h4(
        class="text-md text-secondary"
        v-if="currentSubgroup && currentSubgroup.name !== 'Data'"
      )
        | {{ currentSubgroup.fullName }}
      span(
        class="text-md font-bold mt-2"
      ) {{ popoverData.value }}

      h4(
        class="text-xs text-secondary mt-2"
        v-if="popoverData.source || popoverData.currentYearSource"
      )
        template(v-if="popoverData.source")
          | Source: {{ popoverData.source }}
        template(v-if="popoverData.currentYearSource")
          | Source year: {{ popoverData.currentYearSource }}
  </template>

<script lang="ts" setup>
  defineProps<{
    popoverData: Map.PopoverData
    currentIndicator: Prisma.SerializedIndicatorWithSubgroups
    currentSubgroup?: Prisma.Subgroup
    popperClass?: string
  }>()

  const showPopover = defineModel<boolean>({ required: true })
</script>

<style lang="sass">
  .data-popover.el-popover.el-popper
    --el-popover-padding: 20px

    max-height: calc(100vh - 40px)

    .el-popper__arrow::before
      background-color: white
      border-color: var(--el-popover-border-color)
</style>

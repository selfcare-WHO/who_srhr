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
    .flex.flex-col.gap-2
      h3(class="text-[20px] leading-tight font-bold") {{ popoverData.country }}
      h4(class="text-md font-bold")
        | {{ currentIndicator.displayName }}
      h4(class="text-md" v-if="currentSubgroup && currentSubgroup.name !== 'Data'")
        | {{ currentSubgroup.name }}
      span.text-md {{ popoverData.value }}
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

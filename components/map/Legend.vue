<template lang="pug">
  div(class="absolute bottom-[50px] left-[50px] w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    h3(class="text-sm font-[700] text-regular uppercase")
      | Sexual and reproductive health

    h2(class="text-2xl font-[700] text-regular uppercase")
      | {{ currentIndicator?.fullName }}

    span(class="text-sm text-regular uppercase")
      | Global target status:

    div(class="mt-2 grid grid-cols-2 gap-y-2")
      div(
        v-for="(status, key) in TargetStatus"
        :key="key"
        class="flex items-center gap-2"
      )
        div(
          class="h-4 w-4 rounded-full"
          :style="{ backgroundColor: status.color }"
        )

        span(class="text-sm text-regular")
          | {{ status.name }}
</template>

<script lang="ts" setup>
  import { TargetStatus } from '~/types/enums'

  const mapFiltersStore = useMapFiltersStore()
  const { currentIndicator } = storeToRefs(mapFiltersStore)
</script>

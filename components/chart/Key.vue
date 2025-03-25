<template lang="pug">
  .chart-key-section(class="flex items-center gap-4")
      span(class="text-primary font-bold text-sm")
        | KEY:

      .key-item(
        v-for="target in Object.values(chartKey)"
        class="flex items-center gap-2"
        :key="target.name"
      )
        div(class="h-4 w-4 flex items-center justify-center")
          div(:class="target.twClass")

        span {{ target.name }}
  
  </template>

<script lang="ts" setup>
  const { chartKey } = useEnum()
</script>

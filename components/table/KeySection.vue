<template lang="pug">
.key-section(class="flex flex-col gap-4")
  transition(name="fade" mode="out-in")
    .status-keys(
      v-if="showTargetStatus"
      class="flex items-center gap-4"
    )
      span(class="text-primary font-bold text-sm")
        | TARGET STATUS:

      .key-item(
        v-for="target in Object.values(targetStatus)"
        class="flex items-center gap-2"
        :key="target.name"
      )
        div(
          class="rounded-full h-4 w-4"
          :style="{ backgroundColor: target.color }"
        )

        span {{ target.name }}

    .impact-on-srhr-keys(
      v-else
      class="flex items-center gap-4"
    )
      span(class="text-primary font-bold text-sm")
        | IMPACT ON INTEGRATED SRHR:
      
      .key-item(
        v-for="impact in Object.values(impactOnSrhr)"
        class="flex items-center gap-2"
        :key="impact.name"
      )
        div(
          class="rounded-full h-4 w-4 border-2 flex items-center justify-center"
          :style="{ backgroundColor: impact.bgColor, borderColor: impact.borderColor }"
        )
          ElIcon(
            :color="impact.iconColor"
            size="10"
          )
            component(:is="impact.icon")

        span {{ impact.name }}

</template>

<script lang="ts" setup>
  const { targetStatus, impactOnSrhr } = useEnum()

  const { dataType } = defineProps<{
    dataType?: string
  }>()

  const showTargetStatus = computed(() => dataType === 'numerical_categorical')
</script>

<style lang="sass" scoped>
  // .key-section
  //   svg path
  //     stroke-width: 20px
</style>

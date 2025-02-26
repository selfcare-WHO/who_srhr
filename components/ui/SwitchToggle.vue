<template lang="pug">
.switch-toggle(class="flex justify-between gap-2 items-center")
  span(
    class="font-bold"
    :class=`{
      'text-primary': !modelValue,
      'text-placeholder': modelValue
    }`)
    | {{ disabledOption }}

  ElSwitch.switch(v-model="modelValue")

  span(
    class="font-bold"
    :class=`{
      'text-primary': modelValue,
      'text-placeholder': !modelValue
    }`)
    | {{ enabledOption }}
</template>

<script setup lang="ts">
  const modelValue = defineModel<boolean>({ required: true })

  defineProps<{
    disabledOption?: string
    enabledOption?: string
  }>()
</script>

<style lang="sass" scoped>
  .switch-toggle .switch
    --el-switch-on-color: var(--el-color-primary)
    --el-switch-off-color: var(--el-color-primary)
</style>

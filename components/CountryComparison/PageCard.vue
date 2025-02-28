<template lang="pug">
  .page-card
    img(:src="imgSrc" alt="Card image" class="w-full h-32 object-cover")

    .content
      h2 {{ title }}

      p.text-gray-600.flex-1
        | {{ description }}

      ElButton.w-full(
        type="info"
        round
        size="large"
        @click="navigateTo(path)"
        :disabled="!active"
      )
        | {{ buttonText }}
</template>

<script setup lang="ts">
  const props = defineProps<{
    title: string
    description: string
    imgSrc: string
    path: string
    active: boolean
  }>()

  const buttonText = computed(() => {
    return props.active ? 'Explore now' : 'Coming soon'
  })
</script>

<style lang="sass" scoped>
  .page-card
    box-shadow: 0px 4px 4px 0px #00000040

    @apply flex flex-col bg-white
    @apply rounded-2xl overflow-hidden md:h-[400px] max-w-[350px]

    > .content
      @apply flex-1 flex flex-col justify-between
      @apply px-6 md:px-7 pb-6 md:pb-10 pt-4 md:pt-10
</style>

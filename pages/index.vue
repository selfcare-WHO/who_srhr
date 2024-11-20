<template lang="pug">
  div(
    v-loading="isLoading"
    class="landing-page h-screen w-screen max-w-full flex"
  )
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default'
  })
</script>

<style lang="sass">
  .landing-page
</style>

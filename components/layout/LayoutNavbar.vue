<template lang="pug">
  .layout-navbar
    div(class="u-narrow-content flex items-center justify-center gap-16 h-full")
      NuxtLink(
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="text-white"
      )
        | {{ item.name }}

</template>

<script lang="ts" setup>
  const navigationStore = useNavigationStore()
  const { navItems } = storeToRefs(navigationStore)
</script>

<style lang="sass" scoped>
  .layout-navbar
    @apply absolute bottom-0 left-0 w-full h-12 bg-info-dark

    a
      font-family: Roboto
      font-size: 20px
      font-weight: 500
      line-height: 20px

      &.router-link-active
        @apply underline
</style>

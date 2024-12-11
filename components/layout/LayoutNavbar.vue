<template lang="pug">
  .navbar(class="absolute bottom-0 left-0 w-full h-12 bg-info-dark")
    div(class="u-narrow-content flex items-center justify-center gap-16 h-full")
      NuxtLink(
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['text-white', ...($route.path === item.path ? ['underline'] : [])]"
      )
        | {{ item.name }}
    
</template>

<script lang="ts" setup>
  const navigationStore = useNavigationStore()
  const { navItems } = storeToRefs(navigationStore)
</script>

<style lang="sass" scoped></style>

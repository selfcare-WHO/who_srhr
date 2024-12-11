<template lang="pug">
  header(class="layout-header")
    .wrapper(class="flex h-full flex-wrap gap-5 py-4 px-6")
      img(
        src="@assets/images/WHO-Logo.png" alt="WHO Logo"
        class="h-[36px] md:h-[42px] object-contain self-center"
      )
      img(
        src="@assets/images/HRP_logo_colour-1.png" alt="HRP Logo"
        class="h-[40px] md:h-[46px] object-contain self-center"
      )
      img(
        src="@assets/images/Selfcare-SDG-logo.png" alt="Selfcare SDG Logo"
        class="h-[48px] md:h-[54px] object-contain self-center"
      )
    
</template>

<script lang="ts" setup></script>

<style lang="sass" scoped>
  .layout-header
    @apply flex items-center w-full
    @apply bg-white md:bg-transparent z-10
</style>

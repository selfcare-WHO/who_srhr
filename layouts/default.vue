<template lang="pug">
  .default-layout(class="bg-page min-h-screen min-w-screen max-w-screen flex flex-col")
    .top-layout(class=" flex flex-col justify-center items-center sm:pt-4 sm:px-6 sm:pb-[100px] relative")
      header(class="w-full flex gap-5 mb-36 flex-wrap h-[70px] bg-white sm:bg-transparent")
        img(
          src="@assets/images/WHO-Logo.png" alt="WHO Logo"
          class="h-[22px] sm:h-[42px] object-contain self-center"
        )
        img(
          src="@assets/images/HRP_logo_colour-1.png" alt="HRP Logo"
          class="h-[29px] sm:h-[46px] object-contain self-center"
        )
        img(
          src="@assets/images/Selfcare-SDG-logo.png" alt="Selfcare SDG Logo"
          class="h-[29px] sm:h-[54px] object-contain self-center"
        )

      .main(class="u-narrow-content flex flex-col gap-2")
        .flex
          h1(class="text-white bg-info px-2")
            | Sexual and Reproductive Health and Rights

        .flex
          h3(class="text-primary bg-[#FFFFFFE6] px-2")
            | Data Portal

      .navbar(class="absolute bottom-0 left-0 w-full h-12 bg-info-dark")
        div(class="u-narrow-content flex items-center gap-[74px] h-full")
          NuxtLink(
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="['text-white', ...($route.path === item.path ? ['underline'] : [])]"
          )
            | {{ item.name }}
    
    .content(class="flex-1 flex flex-col")
      slot

    .footer(class="bg-info-dark min-h-[135px] flex flex-col justify-end")
      .footer-content(class="h-14 p-6 bg-primary flex justify-between items-center")
        NuxtLink(
          class="text-white"
          to="/privacy-legal-notice"
        )
          | Privacy Legal Notice

        span(class="text-white")
          | © {{ new Date().getFullYear() }} WHO
</template>

<script setup lang="ts">
  const {
    public: { comparisonFeatureActive }
  } = useRuntimeConfig()

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Country profiles', path: '/country-profiles' },
    ...(comparisonFeatureActive
      ? [{ name: 'Country comparison', path: '/country-comparison/table' }]
      : []),
    { name: 'Indicators & data', path: '/indicators-data' }
  ]
</script>

<style lang="sass">
  .default-layout
    > .top-layout
      @apply bg-[url('~/assets/images/Banner-2.jpg')] bg-cover bg-center

      > .navbar
        font-family: Roboto
        font-size: 20px
        font-weight: 500
        line-height: 20px
</style>

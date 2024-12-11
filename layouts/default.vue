<template lang="pug">
  .default-layout(class="bg-page min-h-screen min-w-screen max-w-screen flex flex-col")
    .top-layout(class="flex flex-col justify-center items-center relative")
      LayoutHeader(class="md:absolute md:top-0 md:left-0 w-full")

      .main-header-content
        .wrapper
          hgroup
            h1(class="text-3xl md:text-4xl text-white bg-info px-2 inline box-decoration-clone")
              | Sexual and Reproductive Health and Rights

            div(class="mb-2 md:mb-4")

            h3(class="text-xl md:text-2xl text-primary bg-[#FFFFFFE6] px-2 inline box-decoration-clone")
              | Data Portal

      LayoutNavbar(class="hidden md:block")
    
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
  import LayoutHeader from '@components/layout/LayoutHeader.vue'
  import LayoutNavbar from '@components/layout/LayoutNavbar.vue'
</script>

<style lang="sass">
  .default-layout
    > .top-layout

      > .main-header-content
        @apply w-full
        @apply bg-[url('~/assets/images/Banner-2.jpg')]
        @apply bg-cover bg-center bg-origin-content

        > .wrapper
          @apply flex flex-col items-center gap-2 z-10
          @apply pt-10 md:pt-36 px-6 pb-10 md:pb-24

      > .navbar
        font-family: Roboto
        font-size: 20px
        font-weight: 500
        line-height: 20px
</style>

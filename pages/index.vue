<template lang="pug">
  div(
    v-loading="isLoading"
    class="home-page h-screen w-screen max-w-full flex flex-col"
  )
    div(class="header flex flex-col justify-center pt-2 px-5 pb-[100px] relative")
      div(class="logos flex gap-5 mb-36")
        img(
          src="@assets/images/WHO-Logo.png" alt="WHO Logo"
          class="h-[42px] object-contain self-center"
        )
        img(
          src="@assets/images/HRP_logo_colour-1.png" alt="HRP Logo"
          class="h-[46px] object-contain self-center"
        )
        img(
          src="@assets/images/Selfcare-SDG-logo.png" alt="Selfcare SDG Logo"
          class="h-[54px] object-contain self-center"
        )

      div(class="main u-narrow-content flex flex-col gap-2")
        .flex
          div(class="px-1 py-2 bg-info")
            h1(class=" text-2xl font-bold text-white")
              | Sexual and Reproductive Health and Rights

        .flex
          div(class="px-1 py-2 bg-[#FFFFFFE6]")
            h2(class="text-lg text-primary")
              | Data Portal

      div(class="navbar absolute bottom-0 left-0 w-full h-12 bg-info")
        div(class="u-narrow-content flex items-center gap-16 h-full")
          NuxtLink(to="/")
            | Home
          NuxtLink(to="/")
            | Country profiles
          NuxtLink(to="/")
            | Countries & regions
          NuxtLink(to="/")
            | Indicators & data
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'default'
  })

  const isLoading = ref(false)
</script>

<style lang="sass">
  .home-page
    > .header
      @apply bg-[url('~/assets/images/Banner-2.jpg')] bg-cover bg-center
</style>

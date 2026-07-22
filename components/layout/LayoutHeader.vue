<template lang="pug">
  header(class="layout-header")
    .header-content

      ElPopover(
        :visible="isMenuOpen"
        :teleported="false"
        :width="200"
        popper-class="menu-popover"
      )
        template(#reference)
          ElButton.menu-button(
            type="info"
            text
            @click="isMenuOpen = !isMenuOpen"
            v-click-outside="() => isMenuOpen = false"
          )
            ElIcon(
              class="pt-1"
              size="36"
            )
              MenuIcon(class="[&>path]:stroke-current")

        template(#default)
          .flex.flex-col.gap-2
            NuxtLink(
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="text-white text-lg"
              target="_top"
              external
            )
              | {{ item.name }}

      .logos-container
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

<script lang="ts" setup>
  import { ClickOutside as vClickOutside } from 'element-plus'
  import MenuIcon from '@assets/icons/menu.svg'

  const navigationStore = useNavigationStore()
  const { navItems } = storeToRefs(navigationStore)

  const isMenuOpen = ref(false)
</script>

<style lang="sass" scoped>
  .layout-header
    @apply flex items-center w-full
    @apply bg-white md:bg-transparent z-10

    > .header-content
      @apply flex items-center justify-between md:justify-start
      @apply h-full w-full px-6 py-4 gap-2

      > .menu-button
        @apply flex items-center justify-center !p-0
        @apply md:hidden

      > .logos-container
        @apply flex items-center flex-wrap gap-5

      > .nuxt-link.router-link-active
        @apply underline

    :deep(.menu-popover)
      background-color: var(--el-color-info) !important
      border-color: var(--el-color-info) !important

      > .el-popper__arrow:before
        background-color: var(--el-color-info) !important
        border-color: var(--el-color-info) !important
</style>

<template lang="pug">
  .country-profiles-page
    h1
      | Country profiles

    p
      | This country snapshot provides an overview of national data relating to sexual and reproductive health and rights (SRHR) throughout the life course. By highlighting the national SRHR situation – including successes, areas for improvement, major challenges, and data gaps – this country profile can be used for determining priorities, planning of programmes, resource mobilization, and strengthening of health systems, service delivery and community engagement.
    
    p.mb-8
      | This snapshot uses the latest data publicly available at the publication date, from reputable international sources (see endnotes for the year and source of each data point).

    ElEmpty(v-if="!isDesktop")
      template(#description)
        p This dashboard is optimized for desktop view.

    tableau-viz(
      v-else
      id="tableau-viz"
      iframe-attribute-class="block w-full"
      src="https://public.tableau.com/views/WHOSRHR/NewContext"
      tabs="no"
      toolbar="yes"
      static-image="https://public.tableau.com/static/images/WH/WHOSRHR/NewContext/1.png"
      animate-transition="yes"
      display-static-image="yes"
      display-spinner="yes"
      display-overlay="yes"
      display-count="yes"
      language="en-GB"
      width="1280px"
      height="2630px"
    )
</template>

<script lang="ts" setup>
  const { isDesktop } = useResponsive()
</script>

<template lang="pug">
  .country-profiles-page
    h1
      | Country profiles

    p
      | This country snapshot provides an overview of national data relating to sexual and reproductive health and rights (SRHR) throughout the life course. By highlighting the national SRHR situation – including successes, areas for improvement, major challenges, and data gaps – this country profile can be used for determining priorities, planning of programmes, resource mobilization, and strengthening of health systems, service delivery and community engagement.
    
    p.mb-8
      | This snapshot uses the latest data publicly available at the publication date, from reputable international sources (see endnotes for the year and source of each data point).

    #viz1732192344237.tableauPlaceholder.relative.overflow-hidden.max-w-full
      object.tableauViz.display-none.max-w-full
        param(name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F')
        param(name='embed_code_version' value='3')
        param(name='site_root' value='')
        param(name='name' value='WHOSRHR/NewContext')
        param(name='tabs' value='no')
        param(name='toolbar' value='yes')
        param(name='static_image' value='https://public.tableau.com/static/images/WH/WHOSRHR/NewContext/1.png')
        param(name='animate_transition' value='yes')
        param(name='display_static_image' value='yes')
        param(name='display_spinner' value='yes')
        param(name='display_overlay' value='yes')
        param(name='display_count' value='yes')
        param(name='language' value='en-GB')
</template>

<script lang="ts" setup>
  onMounted(() => {
    nextTick(() => {
      let divElement: HTMLElement | null =
        document.getElementById('viz1732192344237')

      let vizElement: HTMLObjectElement | undefined =
        divElement?.getElementsByTagName('object')[0]
      vizElement && (vizElement.style.width = '1280px')
      vizElement && (vizElement.style.height = '2627px')

      let scriptElement: HTMLScriptElement = document.createElement('script')

      scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js'

      vizElement?.parentNode?.insertBefore(scriptElement, vizElement)
    })
  })
</script>

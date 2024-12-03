<template lang="pug">
  .indicators-and-data-page(class="flex flex-col flex-1 min-h-0")
    div(class="u-content pt-16 pb-8 flex flex-col gap-6")
      .srhr-indicators-section(class="flex gap-16")
        .srhr-indicators-text(class="flex-1")
          h1 The SRHR indicators

          p This country snapshot provides an overview of national data relating to sexual and reproductive health and rights (SRHR) throughout the life course. Realization of SRHR requires provision of comprehensive, people-centred services, that address the different elements of SRHR, and which are supported by an enabling environment, quality health systems, and meaningful community engagement. Multiple, synergistic cross-linkages exist within and between the different SRHR elements, leading to sequential outcome benefits throughout the life course.

          p By highlighting the national SRHR situation – including successes, areas for improvement, and data gaps – this snapshot can be used for determining priorities, planning of programmes, resource mobilization, and strengthening of health systems, service delivery and community engagement.

        .indicators-diagram(class="flex-1 mr-20")
          img(src="@assets/images/indicators_and_data_diagram.png" alt="The SRHR indicators diagram")

      .data-availability-section(class="flex flex-col gap-6")
        .data-availability-text(class="flex-1")
          h1 Data availability

          p This country profile uses the latest data available that is less than 10 years old as of 30/09/2023 from reliable international data repositories. See endnotes for the year and source of each data point. “No data” means no data were available in the international data source used, but data may be available at the country level. It is acknowledged that intersectionality and people-centredness are not well reflected in available data, and that many categories of information currently collected are gender-binary.

      .targets-section(class="mt-12")
        h2(class="text-2xl font-bold mb-6") TARGETS

        .targets-content(class="flex gap-8")
          .targets-description(class="flex-1")
            p Data points are tagged based on their alignment with global targets. This shows whether the KPI target has been achieved, whether challenges remain or whether major challenges remain. Some data points do not have a specific KPI target (no target), and for others, there is no data available within the last 10 years from reliable international data repositories.

          .targets-legend(class="flex-1")
            .legend-item(class="bg-green-100 p-3 mb-2 text-center") Achieved
            .legend-item(class="bg-orange-100 p-3 mb-2 text-center") Challenges remain
            .legend-item(class="bg-red-100 p-3 mb-2 text-center") Major challenges remain
            .legend-item(class="bg-gray-100 p-3 mb-2 text-center") No data
            .legend-item(class="bg-blue-50 p-3 mb-2 text-center") No target

      .trends-section(class="mt-12")
        h2(class="text-2xl font-bold mb-6") TRENDS

        .trends-content(class="flex gap-8")
          .trends-description(class="flex-1")
            p The trends icons show whether the current numerical data value has increased, decreased or remained the same compared to the previous data point in the past 10 years. In cases where current data is unavailable or where there is no data point in the 10 years prior, "no data available" is indicated. Trend icons are only available for numerical data.

          .trends-legend(class="flex-1")
            .legend-item(class="flex items-center gap-2 mb-2")
              .icon ↑
              span Increased

            .legend-item(class="flex items-center gap-2 mb-2")
              .icon →
              span No change

            .legend-item(class="flex items-center gap-2 mb-2")
              .icon ↓
              span Decreased

            .legend-item(class="flex items-center gap-2 mb-2")
              .icon ⋮⋮
              span No data available
</template>

<script lang="ts" setup></script>

<style lang="sass" scoped></style>

<template lang="pug">
  .home-page(class="flex flex-wrap justify-center gap-10 pt-14 pb-40 mx-auto")
    PageCard(
      v-for="card in cards"
      :key="card.title"
      :title="card.title"
      :description="card.description"
      :imgSrc="card.imgSrc"
      :path="card.path"
      :active="card.active"
    )
</template>

<script setup lang="ts">
  import countryProfiles from '@assets/images/country-profiles.png'
  import countriesRegions from '@assets/images/countries-regions.png'
  import indicatorsData from '@assets/images/indicators-data.png'

  const {
    public: { comparisonFeatureActive }
  } = useRuntimeConfig()

  const cards = [
    {
      title: 'Country profiles',
      description:
        'Country-level infographics with key data, global targets, trends and missing data',
      imgSrc: countryProfiles,
      path: '/country-profiles',
      active: true
    },
    {
      title: 'Country comparison',
      description: 'Tables, charts and maps comparing countries and regions',
      imgSrc: countriesRegions,
      path: 'country-comparison/table',
      active: comparisonFeatureActive
    },
    {
      title: 'Indicators & data',
      description:
        'Information on the SRHR indicators and where the data come from',
      imgSrc: indicatorsData,
      path: '/indicators-data',
      active: true
    }
  ]
</script>

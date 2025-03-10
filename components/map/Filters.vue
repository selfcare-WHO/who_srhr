<template lang="pug">
  div.map-filters-box(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    ElForm(
      class="flex flex-col gap-2"
      label-position="top"
    )
      ElRadioGroup(class="w-full" v-model="dataTypeFilterValue")
        ElRadioButton(
          class="flex-1 [& .el-radio-button__inner]:w-full"
          v-for="option in dataTypeOptions"
          size="small"
          :key="option.id"
          :label="option.name"
          :value="option.id"
        )
      
      FilterItem(
        class="!mb-0"
        v-model="indicatorFilter.value"
        :options="indicatorFilter.options"
        :label="indicatorFilter.label"
        :multiple="!!indicatorFilter?.multiple"
        :tree="indicatorFilter.tree"
        :placeholder="indicatorFilter.placeholder"
        :clearable="!!indicatorFilter?.clearable"
      )

      FilterItem(
        v-if="showSubgroupFilter"
        class="!mb-0"
        v-model="subgroupFilter.value"
        :options="subgroupFilter.options"
        :label="subgroupFilter.label"
        :multiple="!!subgroupFilter?.multiple"
        :tree="subgroupFilter.tree"
        :placeholder="subgroupFilter.placeholder"
        :clearable="!!subgroupFilter?.clearable"
      )
</template>

<script lang="ts" setup>
  const mapFiltersStore = useMapFiltersStore()
  const {
    indicatorFilter,
    subgroupFilter,
    dataTypeFilterValue,
    dataTypeOptions
  } = storeToRefs(mapFiltersStore)

  const showSubgroupFilter = computed(() => {
    return (subgroupFilter.value.options ?? []).length > 1
  })
</script>

<style lang="sass" scoped>
  .map-filters-box
    :deep(.el-radio-button)
      .el-radio-button__inner
        width: 100%
</style>

<template lang="pug">
  div.map-filters-box
    ElForm(
      class="filters-section grid grid-cols-3 gap-6"
      #default
      label-position="top"
    )
      ElFormItem(
        v-for="filter in mapFilters"
        v-show="!filter.hide"
        :key="filter.label"
        class="col-span-1"
        :label="filter.label"
      )
        FilterItem(
          v-model="filter.value"
          :options="filter.options"
          :label="filter.label"
          :multiple="!!filter?.multiple"
          :tree="filter.tree"
          :placeholder="filter.placeholder"
          :clearable="!!filter?.clearable"
          :filterable="filter.filterable"
        )
</template>

<script lang="ts" setup>
  const mapFiltersStore = useMapFiltersStore()
  const { mapFilters } = storeToRefs(mapFiltersStore)
</script>

<style lang="sass" scoped>
  .map-filters-box
    :deep(.el-radio-button)
      .el-radio-button__inner
        width: 100%
</style>

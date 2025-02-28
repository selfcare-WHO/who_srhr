<template lang="pug">
  div.map-filters-box(class="w-[375px] rounded-lg bg-secondary bg-opacity-20 p-4")
    ElForm(
      class="flex flex-col"
      label-position="top"
    )
      ElFormItem(class="w-full !mb-2" label="Data Type")
        ElRadioGroup(class="w-full" v-model="dataTypeFilterValue")
          ElRadioButton(
            class="flex-1 [& .el-radio-button__inner]:w-full"
            v-for="option in dataTypeOptions"
            size="small"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          )
      
      ElFormItem(
        class="w-full !mb-0"
        label="Indicator"
      )
        FilterItem(
          v-model="indicatorFilter.value"
          :options="indicatorFilter.options"
          :label="indicatorFilter.label"
          :multiple="!!indicatorFilter?.multiple"
          :tree="indicatorFilter.tree"
          :placeholder="indicatorFilter.placeholder"
          :clearable="!!indicatorFilter?.clearable"
        )
</template>

<script lang="ts" setup>
  const mapFiltersStore = useMapFiltersStore()
  const { indicatorFilter, dataTypeFilterValue, dataTypeOptions } =
    storeToRefs(mapFiltersStore)
</script>

<style lang="sass" scoped>
  .map-filters-box
    :deep(.el-radio-button)
      .el-radio-button__inner
        width: 100%
</style>

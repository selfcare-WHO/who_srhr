<template lang="pug">
  div(class="absolute top-[50px] left-[50px] w-[285px] rounded-lg bg-secondary bg-opacity-20 p-4")
    ElForm(
      class="flex gap-6 border-b border-primary"
      #default
      label-position="top"
    )
      ElFormItem(
        class="w-full !mb-2"
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
    
    UiSwitchToggle(
      class="mt-2 flex !justify-start"
      v-model="dataTypeFilterValue"
      :disabled-option="dataTypeOptions[0].name"
      :enabled-option="dataTypeOptions[1].name"
    )
</template>

<script lang="ts" setup>
  const mapFiltersStore = useMapFiltersStore()
  const { indicatorFilter, dataTypeFilterValue, dataTypeOptions } =
    storeToRefs(mapFiltersStore)
</script>

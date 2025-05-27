<template lang="pug">
  ElTreeSelect(
    v-if="tree"
    class="w-full mb-2"
    v-model="value"
    ref="selectRef"
    tag-type="primary"
    tag-effect="dark"
    fit-input-width
    default-expand-all
    collapse-tags
    collapse-tags-tooltip
    :show-checkbox="multiple"
    :max-collapse-tags="5"
    :size="size"
    :check-on-click-node="true"
    :expand-on-click-node="false"
    :render-after-expand="false"
    :loading="isFetchingFilters"
    :disabled="isFetchingFilters"
    :placeholder="placeholder || `All ${label}s`"
    :clearable="clearable"
    :multiple="multiple"
    :filterable="multiple || filterable"
    :data="options"
    @check="onChange"
    @change="onChange"
    @blur="multiple && $emit('blur')"
    @clear="$emit('clear')"
    @remove-tag="$emit('removeTag')"
  )

  ElSelect(
    v-else
    class="w-full mb-2"
    tag-type="primary"
    tag-effect="dark"
    v-model="value"
    ref="selectRef"
    fit-input-width
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="5"
    :size="size"
    :clearable="clearable"
    :filterable="multiple || filterable"
    :loading="isFetchingFilters"
    :disabled="isFetchingFilters"
    :placeholder="placeholder || `All ${label}s`"
    :multiple="multiple"
    @change="onChange"
    @blur="multiple && $emit('blur')"
    @clear="$emit('clear')"
    @remove-tag="$emit('removeTag')"
  )
    ElOption(
      v-for="option in options"
      :key="option.id"
      :label="option.label || option.name"
      :value="option.id"
    )
  </template>

<script setup lang="ts">
  const dataStore = useFiltersStore()
  const { isFetchingFilters } = storeToRefs(dataStore)

  const value = defineModel<string[] | string>({ required: true })

  const {
    label,
    options,
    multiple,
    tree,
    placeholder,
    clearable,
    size = 'small',
    filterable = false
  } = defineProps<{
    label: string
    options: Filter.Option[]
    multiple: boolean
    tree?: boolean
    placeholder?: string
    clearable: boolean
    size?: 'large' | 'small' | 'default'
    filterable?: boolean
  }>()

  const emit = defineEmits<{
    blur: []
    clear: []
    removeTag: []
    change: [string[] | string]
  }>()

  const selectRef = ref()

  function onChange(value: string[] | string) {
    if (!multiple) {
      emit('change', value)
      selectRef.value?.blur()
    }
  }
</script>

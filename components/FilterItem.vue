<template lang="pug">
  ElTreeSelect(
    v-if="tree"
    class="w-full mb-2"
    v-model="value"
    tag-type="primary"
    tag-effect="dark"
    show-checkbox
    fit-input-width
    default-expand-all
    :size="size"
    :check-on-click-node="true"
    :expand-on-click-node="false"
    :loading="isFetchingFilters"
    :disabled="isFetchingFilters"
    :placeholder="placeholder || `All ${label}s`"
    :clearable="clearable"
    :multiple="multiple"
    :filterable="multiple"
    :data="options"
    @check="!multiple && $emit('change')"
    @change="!multiple && $emit('change')"
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
    fit-input-width
    :size="size"
    :clearable="clearable"
    :filterable="multiple"
    :loading="isFetchingFilters"
    :disabled="isFetchingFilters"
    :placeholder="placeholder || `All ${label}s`"
    :multiple="multiple"
    @change="!multiple && $emit('change')"
    @blur="multiple && $emit('blur')"
    @clear="$emit('clear')"
    @remove-tag="$emit('removeTag')"
  )
    ElOption(
      v-for="option in options"
      :key="option.id"
      :label="option.name"
      :value="option.id"
    )
  </template>

<script setup lang="ts">
  const dataStore = useFiltersStore()
  const { isFetchingFilters } = storeToRefs(dataStore)

  const value = defineModel<string[]>({ required: true })

  const {
    label,
    options,
    multiple,
    tree,
    placeholder,
    clearable,
    size = 'small'
  } = defineProps<{
    label: string
    options: Filter.Option[]
    multiple: boolean
    tree?: boolean
    placeholder?: string
    clearable: boolean
    size?: 'large' | 'small' | 'default'
  }>()

  defineEmits<{
    blur: []
    clear: []
    removeTag: []
    change: []
  }>()
</script>

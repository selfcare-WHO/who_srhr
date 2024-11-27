export const getFilterValues = (
  filters: ReadonlyArray<Filter.Item>
): Filter.Values =>
  filters.reduce<Filter.Values>(
    (acc, filter) => {
      const isTree = filter.tree
      const isArray = Array.isArray(filter.value)

      if (isTree) {
        acc[filter.key] = filter.value.value
          .filter(value => value?.includes?.(filter.key))
          .map(value => value.split('-')[1])

        if (filter.childrenKey) {
          acc[filter.childrenKey] = filter.value.value
            .filter(value => value.includes(filter.childrenKey ?? ''))
            .map(value => value.split('-')[1])
        }
      }

      if (isArray) {
        acc[filter.key] = filter.value.value
      }

      return acc
    },
    { indicator: [], country: [] }
  )

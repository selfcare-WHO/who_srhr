import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch, type Ref } from 'vue'

/**
 * General-purpose composable to keep Pinia / component filter refs in sync with the current route query and vice-versa.
 *
 * It is completely agnostic of the store implementation – you simply provide a map that
 * describes how each query key should be linked to a reactive ref together with
 * optional validation / (de)serialization helpers.
 *
 * Example usage for a map view (simplified):
 *
 * const { isInitializing } = useSyncRouteFilters({
 *   dataType: {
 *     ref: dataTypeFilterValue,
 *     validValues: ['numerical_categorical', 'laws_policies', 'targets']
 *   },
 *   indicator: {
 *     ref: indicatorFilterValue,
 *     validate: async (val) => indicatorOptions.value.some(opt => opt.id === val),
 *     waitForReady: () => indicatorOptions.value.length > 0
 *   },
 *   subgroup: {
 *     ref: subgroupFilterValue,
 *     validate: (val) => currentIndicator.value?.subgroups?.some(sg => String(sg.id) === val) ?? false,
 *     waitForReady: () => currentIndicator.value?.subgroups?.length > 0
 *   }
 * })
 */

export interface FilterSyncConfig<T = string> {
  /**
   * Reactive reference that holds the current value of the filter.
   */
  ref: Ref<T>
  /**
   * List of allowed values (cheap validation).
   */
  validValues?: T[]
  /**
   * Validation function executed before a query value is committed to the ref.
   */
  validate?: (value: any) => boolean | Promise<boolean>
  /**
   * Transform a raw query value into the type expected by the ref.
   */
  parse?: (value: any) => T
  /**
   * Transform the ref value into something that can be stored in the route query.
   */
  stringify?: (value: T) => any
  /**
   * Optional function signalling when the external state this filter relies on is ready.
   * If it returns a boolean it will be polled every 50 ms until `true`.
   * If it returns a Promise, it will be awaited once.
   */
  waitForReady?: () => boolean | Promise<unknown>
}

export function useSyncRouteFilters(
  filters: Record<string, FilterSyncConfig<any>>
) {
  const route = useRoute()
  const router = useRouter()

  const isInitializing = ref(true)

  /**
   * Wait until a certain condition becomes true.
   */
  const waitUntil = (condition: () => boolean) =>
    new Promise<void>(resolve => {
      if (condition()) return resolve()
      const timer = setInterval(() => {
        if (condition()) {
          clearInterval(timer)
          resolve()
        }
      }, 50)
    })

  /**
   * Step 1 – read the current route query and try to apply it to the provided refs.
   */
  const initializeFromQuery = async () => {
    const query = route.query

    for (const key in filters) {
      const cfg = filters[key]
      const rawValue = query[key]

      // Skip absent query keys
      if (rawValue === undefined) continue

      // Ensure external dependencies are ready (if specified)
      if (cfg.waitForReady) {
        const readyResult = cfg.waitForReady()
        if (typeof readyResult === 'boolean') {
          if (!readyResult)
            await waitUntil(() => cfg.waitForReady!() as boolean)
        } else if (readyResult instanceof Promise) {
          await readyResult
        }
      }

      // Convert & validate the incoming value
      const parsedValue = cfg.parse ? cfg.parse(rawValue) : (rawValue as any)

      let isValid = true
      if (cfg.validValues && Array.isArray(cfg.validValues)) {
        isValid = cfg.validValues.includes(parsedValue)
      }
      if (isValid && cfg.validate) {
        isValid = await cfg.validate(parsedValue)
      }

      if (isValid) {
        cfg.ref.value = parsedValue
      }
    }

    isInitializing.value = false
  }

  /**
   * Step 2 – whenever any of the refs change, update the route (unless we are still initialising).
   */
  const updateRouteQuery = () => {
    if (isInitializing.value) return

    const newQuery: Record<string, any> = {}
    const currentQuery = route.query

    // Preserve unrelated query parameters
    Object.keys(currentQuery).forEach(key => {
      if (!(key in filters)) newQuery[key] = currentQuery[key]
    })

    // Serialize filter refs
    for (const key in filters) {
      const cfg = filters[key]
      const value = cfg.ref.value as any

      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        continue // omit empty values
      }

      newQuery[key] = cfg.stringify ? cfg.stringify(value) : value
    }

    router.replace({ path: route.path, query: newQuery })
  }

  // Watch all refs – deep because some are arrays
  watch(
    () => Object.values(filters).map(cfg => cfg.ref?.value),
    updateRouteQuery,
    { deep: true }
  )

  onMounted(() => {
    initializeFromQuery()
  })

  return {
    isInitializing
  }
}

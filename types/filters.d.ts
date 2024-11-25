declare namespace Filter {
  type Option = {
    id: string | number
    name?: string
    value?: string
    children?: Option[]
  }

  type Value = string[] | number[] | string | number | undefined

  type Label = 'Domain' | 'Indicator' | 'Year' | 'Target' | 'Aggregator'

  type Key = 'indicator' | 'country'

  type Filter = {
    key: Key
    label: Label
    placeholder?: string
    value: Value
    options: Option[] | ComputedRef<Option[]>
    multiple: boolean | ComputedRef<boolean>
    tree?: boolean | ComputedRef<boolean>
    childrenKey?: Key
    clearable: boolean | ComputedRef<boolean>
  }
}

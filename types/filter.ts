declare global {
  namespace Filter {
    type Option = {
      id: string | number
      name?: string
      value?: string
      children?: Option[]
    }

    type Label = 'Indicator' | 'Country' | 'Data Type' | 'Subgroup'

    type Key = 'indicator' | 'country' | 'dataType' | 'subgroup'

    type Item<K extends Key = Key> = {
      key: K
      label: Label
      placeholder?: string
      value: MaybeRef<string> | MaybeRef<string[]>
      options: MaybeRef<Option[]>
      multiple: boolean
      tree?: boolean
      childrenKey?: Key
      clearable: boolean
      hide?: MaybeRefOrGetter<boolean>
      filterable?: boolean
    }

    type TableValues = {
      indicator: string[]
      country: string[]
      dataType: string
    }

    type ReadonlyValues = {
      indicator?: string[]
      country?: string[]
      dataType?: string
    }

    type Options = {
      domains?: Prisma.Domain[]
      indicators?: Prisma.SerializedIndicatorWithSubgroups[]
      countries?: Prisma.Country[]
    }

    type DataType = 'numerical_categorical' | 'laws_policies' | 'targets'
  }
}

declare global {
  namespace Filter {
    type Option = {
      id: string | number
      name?: string
      value?: string
      children?: Option[]
    }

    type Label = 'Indicator' | 'Country' | 'Data Type'

    type Key = 'indicator' | 'country' | 'dataType'

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

    type MapDataType = 'heatmap' | 'targets' | 'nominal'

    type MapDataTypeOption = {
      id: MapDataType
      name: string
    }
  }
}

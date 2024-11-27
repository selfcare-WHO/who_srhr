declare namespace Filter {
  type Option = {
    id: string | number
    name?: string
    value?: string
    children?: Option[]
  }

  type Label = 'Indicator' | 'Country'

  type Key = 'indicator' | 'country'

  type Item<K extends Key = Key> = {
    key: K
    label: Label
    placeholder?: string
    value: MaybeRef<string[]>
    options: ComputedRef<Option[]>
    multiple: MaybeRef<boolean>
    tree?: MaybeRef<boolean>
    childrenKey?: Key
    clearable: MaybeRef<boolean>
  }

  type Values = {
    indicator: MaybeRef<string[]>
    country: MaybeRef<string[]>
  }

  type ReadonlyValues = {
    indicator: string[]
    country: string[]
  }

  type Options = {
    domains: Prisma.Domain[]
    indicators: Prisma.IndicatorInclude[]
    countries: Prisma.Country[]
  }
}

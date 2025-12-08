import type { ColumnDefinition } from 'tabulator-tables'

declare global {
  namespace Data {
    type IndicatorDataType =
      | 'Percentage'
      | 'Number'
      | 'Rate'
      | 'Nominal'
      | 'Ratio/Rank'
      | 'Monetary'

    type DataRow = {
      kpi_id: string
      kpi_name: string
      kpi_full_name: string
      kpi_subheading: string
      kpi_data_type: string
      kpi_domain_id: number
      table_view: string
      chart_view: string
      map_view: string
      map_type?: string
      domain_id: number
      domain_name: string
      kpi_subgroup: string
      kpi_subgroup_full: string
      current_year_source?: string
      current_year?: number
      source?: string
      original_value?: string
      value_to_use?: number
      value?: number
      trend_color?: string
      change: string
      has_target: string
      country: string
      country_code: string
      country_income_type?: string
      mask: string
      is_law?: string
      translate_value?: string
      display_value?: string
      invert_scale?: string
      endnote?: string
    }

    type CountryRow = {
      country: string
      who_region: string
      country_code: string
      country_income_type?: string
    }

    interface IndicatorTooltipData {
      fullName?: string
      subheading?: string
      element?: HTMLElement
    }

    interface TableRow {
      country: string
      [key: string]: any
    }

    interface TableData {
      columns: ColumnDefinition[]
      data: TableRow[]
    }

    type Value = number | string | null | undefined

    interface Legend {
      [key: string]: {
        name: string
        dbValue?: string
        color?: string
        icon?: any
        iconColor?: string
        bgColor?: string
        borderColor?: string
        solidColor?: string
        twClass?: string
        hatchPattern?: boolean
        secondaryColor?: string
      }
    }
  }
}

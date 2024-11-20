declare namespace Data {
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
  }
}

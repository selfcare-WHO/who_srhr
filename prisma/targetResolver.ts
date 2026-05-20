const targetKey = (countryCode: string, kpiName: string, kpiSubgroup: string) =>
  `${countryCode}|${kpiName}|${kpiSubgroup}`

export function buildTargetMap(rows: Data.TargetCodingRow[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const row of rows) {
    map.set(targetKey(row['Country code'], row.KPI, row.Split), row['Target color'])
  }
  return map
}

export function resolveChange(
  row: Data.DataRow,
  targetMap: Map<string, string>
): string {
  if (row.has_target !== 'Yes') return row.change
  return targetMap.get(targetKey(row.country_code, row.kpi_name, row.kpi_subgroup)) ?? row.change
}

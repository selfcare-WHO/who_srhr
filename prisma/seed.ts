import { fileURLToPath } from 'url'
import prisma from '@lib/prisma'
import xlsx from 'xlsx'
import { buildTargetMap, resolveChange } from './targetResolver'

let targetMap: Map<string, string> = new Map()

async function resetDatabase() {
  await prisma.dataPoint.deleteMany({})
  await prisma.indicator.deleteMany({})
  await prisma.subgroup.deleteMany({})
  await prisma.country.deleteMany({})
  await prisma.domain.deleteMany({})
}

type IndicatorEntry = {
  id: string
  name: string
  fullName: string
  subheading: string
  type: string
  domainId: number
  mask: string
  translateValue?: string
  hasTarget: boolean
  isLaw: boolean
  tableView: boolean
  chartView: boolean
  mapView: boolean
  mapType?: string
  displayValue?: string
  endnote?: string
  subgroupNames: Set<string>
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  await resetDatabase()

  const path = fileURLToPath(new URL('./data.xlsx', import.meta.url))
  const workbook = xlsx.readFile(path, { cellText: false, cellDates: false })
  const worksheet = workbook.Sheets['Comparison data']

  const dataRows = xlsx.utils.sheet_to_json(worksheet, { raw: false, defval: null }) satisfies Data.DataRow[]

  const countriesSheet = workbook.Sheets['WHO Countries']
  const countriesRows = xlsx.utils.sheet_to_json(
    countriesSheet
  ) satisfies Data.CountryRow[]

  const targetCodingSheet = workbook.Sheets['Target coding']
  const targetCodingRows = xlsx.utils.sheet_to_json(targetCodingSheet, {
    raw: false,
    defval: null
  }) satisfies Data.TargetCodingRow[]
  targetMap = buildTargetMap(targetCodingRows)

  // 1. Dedup pass — collect unique domains / subgroups / indicators in memory.
  const domains = new Map<number, string>()
  const subgroups = new Map<string, { fullName: string; invertScale: boolean }>()
  const indicators = new Map<string, IndicatorEntry>()

  for (const row of dataRows) {
    const domainId =
      typeof row.domain_id === 'string' ? parseInt(row.domain_id, 10) : row.domain_id
    if (!domains.has(domainId)) domains.set(domainId, row.domain_name)

    if (!subgroups.has(row.kpi_subgroup)) {
      subgroups.set(row.kpi_subgroup, {
        fullName: row.kpi_subgroup_full || '',
        invertScale: row.invert_scale === 'Yes'
      })
    }

    const kpiId = String(row.kpi_id)
    const indicator = indicators.get(kpiId)
    if (indicator) {
      indicator.subgroupNames.add(row.kpi_subgroup)
    } else {
      indicators.set(kpiId, {
        id: kpiId,
        name: row.kpi_name,
        fullName: row.kpi_full_name,
        subheading:
          row.kpi_subheading?.trim() === '-' ? '' : row.kpi_subheading?.trim() || '',
        type: row.kpi_data_type,
        domainId,
        mask: row.mask,
        translateValue: row.translate_value,
        hasTarget: row.has_target === 'Yes',
        isLaw: row.is_law === 'Yes',
        tableView: row.table_view === 'Yes',
        chartView: row.chart_view === 'Yes',
        mapView: row.map_view === 'Yes',
        mapType: row.map_type,
        displayValue: row.display_value,
        endnote: row.endnote?.split('Source: ').pop()?.trim(),
        subgroupNames: new Set([row.kpi_subgroup])
      })
    }
  }

  // 2. Bulk insert in dependency order, inside one transaction.
  await prisma.$transaction(async tx => {
    await tx.domain.createMany({
      data: [...domains].map(([id, name]) => ({ id, name }))
    })

    await tx.country.createMany({
      data: countriesRows.map(row => ({
        name: row.country,
        code: row.country_code,
        region: row.who_region
      }))
    })

    await tx.subgroup.createMany({
      data: [...subgroups].map(([name, s]) => ({
        name,
        fullName: s.fullName,
        invertScale: s.invertScale
      }))
    })

    for (const ind of indicators.values()) {
      await tx.indicator.create({
        data: {
          id: ind.id,
          name: ind.name,
          fullName: ind.fullName,
          subheading: ind.subheading,
          type: ind.type,
          domainId: ind.domainId,
          mask: ind.mask,
          translateValue: ind.translateValue,
          hasTarget: ind.hasTarget,
          isLaw: ind.isLaw,
          tableView: ind.tableView,
          chartView: ind.chartView,
          mapView: ind.mapView,
          mapType: ind.mapType,
          displayValue: ind.displayValue,
          endnote: ind.endnote,
          subgroups: {
            connect: [...ind.subgroupNames].map(name => ({ name }))
          }
        }
      })
    }

    // Build id maps now that subgroups/countries exist.
    const subgroupRows = await tx.subgroup.findMany({ select: { id: true, name: true } })
    const subgroupId = new Map(subgroupRows.map(s => [s.name, s.id]))
    const countryRows = await tx.country.findMany({ select: { id: true, code: true } })
    const countryId = new Map(countryRows.map(c => [c.code, c.id]))

    const dataPoints = dataRows.map(row => {
      const currentYear =
        typeof row.current_year === 'string'
          ? parseInt(row.current_year, 10)
          : row.current_year

      return {
        indicatorId: String(row.kpi_id),
        subgroupId: subgroupId.get(row.kpi_subgroup),
        countryId: countryId.get(row.country_code)!,
        currentYearSource: row.current_year_source,
        currentYear,
        source: row.source,
        originalValue: row.original_value != null ? String(row.original_value) : undefined,
        parsedValue: row.value_to_use != null ? String(row.value_to_use) : undefined,
        value: row.value != null ? String(row.value) : undefined,
        change: resolveChange(row, targetMap),
        trend: row.trend_color
      }
    })

    for (const batch of chunk(dataPoints, 1000)) {
      await tx.dataPoint.createMany({ data: batch })
    }
  }, { timeout: 60000 })
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

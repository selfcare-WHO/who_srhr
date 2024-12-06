import { fileURLToPath } from 'url'
import prisma from '@lib/prisma'
import xlsx from 'xlsx'

async function resetDatabase() {
  await prisma.dataPoint.deleteMany({})
  await prisma.indicator.deleteMany({})
  await prisma.subgroup.deleteMany({})
  await prisma.country.deleteMany({})
  await prisma.domain.deleteMany({})
}

async function seedDomain(row: Data.DataRow) {
  return prisma.domain.upsert({
    where: { id: row.domain_id },
    update: {},
    create: {
      id: row.domain_id,
      name: row.domain_name
    }
  })
}

async function seedCountry(row: Data.DataRow) {
  return prisma.country.upsert({
    where: { code: row.country_code },
    update: {},
    create: {
      name: row.country,
      code: row.country_code,
      incomeType: row.country_income_type
    }
  })
}

async function seedSubgroup(row: Data.DataRow) {
  return prisma.subgroup.upsert({
    where: { name: row.kpi_subgroup },
    update: {},
    create: {
      name: row.kpi_subgroup
    }
  })
}

async function seedIndicator(row: Data.DataRow) {
  const subgroups = await prisma.subgroup.findMany({
    where: { indicators: { some: { id: String(row.kpi_id) } } }
  })

  return prisma.indicator.upsert({
    where: { name: row.kpi_name },
    update: {
      subgroups: {
        connect: [
          ...subgroups.map(subgroup => ({ name: subgroup.name })),
          { name: row.kpi_subgroup }
        ]
      }
    },
    create: {
      id: String(row.kpi_id),
      name: row.kpi_name,
      fullName: row.kpi_full_name,
      subheading:
        row.kpi_subheading.trim() === '-' ? '' : row.kpi_subheading.trim(),
      domain: { connect: { id: row.domain_id } },
      type: row.kpi_data_type,
      subgroups: {
        connect: { name: row.kpi_subgroup }
      },
      mask: row.mask,
      hasTarget: row.has_target === 'Yes',
      isLaw: row.is_law === 'Yes',
      tableView: row.table_view === 'Yes',
      chartView: row.chart_view === 'Yes',
      mapView: row.map_view === 'Yes',
      mapType: row.map_type
    }
  })
}

async function seedDataPoint(row: Data.DataRow) {
  return prisma.dataPoint.create({
    data: {
      indicator: { connect: { id: String(row.kpi_id) } },
      subgroup: { connect: { name: row.kpi_subgroup } },
      country: { connect: { code: row.country_code } },
      currentYearSource: row.current_year_source,
      currentYear: row.current_year,
      source: row.source,
      originalValue: row.original_value?.toString(),
      parsedValue: row.value_to_use?.toString(),
      value: row.value?.toString(),
      change: row.change,
      trend: row.trend_color
    }
  })
}

async function main() {
  await resetDatabase()

  const path = fileURLToPath(new URL('./data.xlsx', import.meta.url))
  const workbook = xlsx.readFile(path)
  const worksheet = workbook.Sheets['Comparison data']

  const dataRows = xlsx.utils.sheet_to_json(worksheet) satisfies Data.DataRow[]

  for (const row of dataRows) {
    await seedDomain(row)
    await seedCountry(row)
    await seedSubgroup(row)
    await seedIndicator(row)
    await seedDataPoint(row)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

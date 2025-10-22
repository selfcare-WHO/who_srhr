const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Read Excel file
  const workbook = XLSX.readFile('prisma/data.xlsx');
  const worksheet = workbook.Sheets['Comparison data'];
  const excelData = XLSX.utils.sheet_to_json(worksheet);

  console.log('=== EXCEL DATA CHECK ===\n');
  console.log('Available sheets:', workbook.SheetNames.join(', '));
  console.log('Total rows in Comparison data:', excelData.length);

  // Get a sample of data for indicator 117
  const indicator117Excel = excelData
    .filter(row => row.kpi_id === 117)
    .slice(0, 10);

  console.log('\n=== Sample Excel Data for Indicator 117 ===');
  console.log('Country | Value | Change | Trend');
  console.log('-'.repeat(80));
  indicator117Excel.forEach(row => {
    console.log(`${row.country_code?.padEnd(7)} | ${String(row.value || '').padEnd(5)} | ${String(row.change || '').padEnd(6)} | ${row.trend_color || ''}`);
  });

  // Now check database
  console.log('\n\n=== DATABASE DATA CHECK ===\n');

  const dbData = await prisma.dataPoint.findMany({
    where: {
      indicatorId: '117'
    },
    include: {
      country: true,
      indicator: true
    },
    take: 10
  });

  console.log('Total datapoints for indicator 117 in DB:',
    await prisma.dataPoint.count({
      where: { indicatorId: '117' }
    })
  );

  console.log('\n=== Sample Database Data for Indicator 117 ===');
  console.log('Country | Value | Change | Trend');
  console.log('-'.repeat(80));
  dbData.forEach(row => {
    console.log(`${row.country.code.padEnd(7)} | ${String(row.value || '').padEnd(5)} | ${String(row.change || '').padEnd(6)} | ${row.trend || ''}`);
  });

  // Compare specific values
  console.log('\n\n=== COMPARISON: Excel vs Database ===\n');

  const excelByCountry = new Map();
  excelData
    .filter(row => row.kpi_id === 117)
    .forEach(row => {
      excelByCountry.set(row.country_code, {
        value: row.value,
        change: row.change,
        trend: row.trend_color
      });
    });

  const dbByCountry = new Map();
  const allDbData = await prisma.dataPoint.findMany({
    where: { indicatorId: '117' },
    include: { country: true }
  });

  allDbData.forEach(row => {
    dbByCountry.set(row.country.code, {
      value: row.value,
      change: row.change,
      trend: row.trend
    });
  });

  console.log('Excel entries:', excelByCountry.size);
  console.log('Database entries:', dbByCountry.size);

  const mismatches = [];
  excelByCountry.forEach((excelVal, countryCode) => {
    const dbVal = dbByCountry.get(countryCode);
    if (!dbVal) {
      mismatches.push(`${countryCode}: Missing in database`);
    } else if (excelVal.value != dbVal.value || excelVal.change != dbVal.change) {
      mismatches.push(`${countryCode}: Excel(${excelVal.value},${excelVal.change}) != DB(${dbVal.value},${dbVal.change})`);
    }
  });

  if (mismatches.length > 0) {
    console.log('\n⚠️  MISMATCHES FOUND:');
    mismatches.slice(0, 20).forEach(m => console.log('  ' + m));
    if (mismatches.length > 20) {
      console.log(`  ... and ${mismatches.length - 20} more`);
    }
  } else {
    console.log('\n✓ All Excel data matches database!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

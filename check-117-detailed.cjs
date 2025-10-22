const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Read Excel file
  const workbook = XLSX.readFile('prisma/data.xlsx');
  const worksheet = workbook.Sheets['Comparison data'];
  const excelData = XLSX.utils.sheet_to_json(worksheet);

  console.log('=== CHECKING INDICATOR 117 IN EXCEL ===\n');

  // Find all rows for indicator 117
  const ind117Data = excelData.filter(row => {
    return row.kpi_id === 117 || row.kpi_id === '117';
  });

  console.log('Total rows for indicator 117:', ind117Data.length);

  if (ind117Data.length > 0) {
    console.log('\nFirst 10 rows:');
    console.log('Country | Value | Change | Original Value | Parsed Value');
    console.log('-'.repeat(100));

    ind117Data.slice(0, 10).forEach(row => {
      console.log(
        `${(row.country_code || '').toString().padEnd(7)} | ` +
        `${(row.value || '').toString().padEnd(5)} | ` +
        `${(row.change || '').toString().padEnd(25)} | ` +
        `${(row.original_value || '').toString().padEnd(14)} | ` +
        `${(row.value_to_use || '').toString()}`
      );
    });

    // Show columns available
    console.log('\n\nColumns in first row:');
    console.log(Object.keys(ind117Data[0]).join(', '));
  }

  // Now check database
  console.log('\n\n=== CHECKING INDICATOR 117 IN DATABASE ===\n');

  const dbData = await prisma.dataPoint.findMany({
    where: {
      indicatorId: '117'
    },
    include: {
      country: true
    },
    take: 10
  });

  console.log('Total rows in database:', await prisma.dataPoint.count({
    where: { indicatorId: '117' }
  }));

  console.log('\nFirst 10 rows:');
  console.log('Country | Value | Change | Original Value | Parsed Value');
  console.log('-'.repeat(100));

  dbData.forEach(row => {
    console.log(
      `${row.country.code.padEnd(7)} | ` +
      `${(row.value || '').toString().padEnd(5)} | ` +
      `${(row.change || '').toString().padEnd(25)} | ` +
      `${(row.originalValue || '').toString().padEnd(14)} | ` +
      `${(row.parsedValue || '').toString()}`
    );
  });

  // Now let's specifically check Antigua and Barbuda
  console.log('\n\n=== ANTIGUA AND BARBUDA (ATG) COMPARISON ===\n');

  const excelATG = ind117Data.find(row => row.country_code === 'ATG');
  const dbATG = await prisma.dataPoint.findFirst({
    where: {
      indicatorId: '117',
      country: {
        code: 'ATG'
      }
    },
    include: {
      country: true
    }
  });

  console.log('Excel data:');
  if (excelATG) {
    console.log(JSON.stringify(excelATG, null, 2));
  } else {
    console.log('NOT FOUND');
  }

  console.log('\nDatabase data:');
  if (dbATG) {
    console.log(JSON.stringify({
      country: dbATG.country.code,
      value: dbATG.value,
      change: dbATG.change,
      originalValue: dbATG.originalValue,
      parsedValue: dbATG.parsedValue,
      currentYear: dbATG.currentYear,
      trend: dbATG.trend
    }, null, 2));
  } else {
    console.log('NOT FOUND');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

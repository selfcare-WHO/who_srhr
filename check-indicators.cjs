const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Read Excel file
  const workbook = XLSX.readFile('prisma/data.xlsx');
  const worksheet = workbook.Sheets['Comparison data'];
  const excelData = XLSX.utils.sheet_to_json(worksheet);

  // Get unique indicator IDs from Excel
  const excelIndicators = new Set();
  excelData.forEach(row => {
    if (row.kpi_id) {
      excelIndicators.add(row.kpi_id);
    }
  });

  console.log('=== INDICATOR IDs IN EXCEL ===');
  console.log('Total unique indicators:', excelIndicators.size);
  console.log('IDs:', Array.from(excelIndicators).sort((a, b) => a - b).join(', '));

  // Check database indicators
  const dbIndicators = await prisma.indicator.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          dataPoints: true
        }
      }
    }
  });

  console.log('\n=== INDICATOR IDs IN DATABASE ===');
  console.log('Total indicators:', dbIndicators.length);
  dbIndicators.slice(0, 20).forEach(ind => {
    console.log(`ID ${ind.id.padEnd(5)} - ${ind.name} (${ind._count.dataPoints} datapoints)`);
  });

  // Look for the indicator that might be "117" or related to SDG 3.7.1
  console.log('\n=== SEARCHING FOR SPECIFIC INDICATORS ===');

  const sdgIndicators = dbIndicators.filter(ind =>
    ind.name.toLowerCase().includes('sdg') ||
    ind.name.toLowerCase().includes('3.7.1') ||
    ind.id === '117'
  );

  console.log('SDG/3.7.1 related indicators:');
  sdgIndicators.forEach(ind => {
    console.log(`  ID ${ind.id} - ${ind.name}`);
  });

  // Check what's in Excel for similar indicators
  console.log('\n=== EXCEL DATA FOR SIMILAR INDICATORS ===');
  const excelSample = excelData
    .filter(row => {
      const name = row.kpi_name || '';
      return name.toLowerCase().includes('sdg') || name.toLowerCase().includes('3.7.1');
    })
    .slice(0, 5);

  excelSample.forEach(row => {
    console.log(`ID ${row.kpi_id} - ${row.kpi_name}`);
    console.log(`  Country: ${row.country_code}, Value: ${row.value}, Change: ${row.change}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

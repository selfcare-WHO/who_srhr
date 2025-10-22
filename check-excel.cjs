const XLSX = require('xlsx');

const workbook = XLSX.readFile('prisma/data.xlsx');
const worksheet = workbook.Sheets['DataPoint'];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Checking indicator 117 data from Excel:');
console.log('Country Code | Value      | Change (from Excel)');
console.log('-'.repeat(70));

const indicator117Data = data
  .filter(row => row.kpi_id === 117)
  .filter(row => row.change && row.change !== 'Data not available' && row.change !== 'No Data')
  .map(row => ({
    code: row.country_code,
    value: row.value,
    change: row.change
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

indicator117Data.forEach(row => {
  const codeStr = String(row.code).padEnd(12);
  const valueStr = String(row.value).padEnd(10);
  console.log(`${codeStr} | ${valueStr} | ${row.change}`);
});

console.log('\nTotal rows with data:', indicator117Data.length);

// Now compare with database
console.log('\n\n=== Comparing Excel vs Database ===\n');

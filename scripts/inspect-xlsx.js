const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../public/Development of an Alumni Database System for the Electronics Engineering, Industrial Engineering, and Mechanical Engineering Departments of the College of Engineering Using System Development Life Cycle .xlsx');

const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

// Find batch 2019 entries and log their jobAt8yr field
console.log('Looking for batch 2019 entries with jobAt8yr data...\n');

let found = 0;
data.forEach((row, index) => {
  const batch = row['Batch'] || row['batch'] || row['BATCH'];
  const jobAt8yr = row['Job (8 years)'] || row['jobAt8yr'] || row['8 Year Job'];

  // Check all keys to find the right columns
  if (index < 5) {
    console.log('Available keys:', Object.keys(row));
  }

  if (batch === 2019 || batch === '2019') {
    if (jobAt8yr && String(jobAt8yr).trim().length > 0) {
      found++;
      console.log(`Entry ${index}: Batch ${batch}`);
      console.log(`Raw jobAt8yr field:\n${jobAt8yr}`);
      console.log('---');
      if (found >= 3) return; // Just show first 3
    }
  }
});

if (found === 0) {
  console.log('\nNo 2019 batch entries found with standard column names. Trying alternate search...');
  console.log('\nFirst few rows:');
  data.slice(0, 3).forEach((row, i) => {
    console.log(`\nRow ${i}:`, row);
  });
}

const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();

function excelDateToJSDate(serial: any) {

  if (!serial || isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

async function main() {
  const filePath = path.join(__dirname, '../../spreadsheet/Job.Opportunities.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Skip the first 2 header rows
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  const rows = data.slice(3); // Data starts at row 4 (index 3)

  console.log(`Parsing ${rows.length} rows...`);

  for (const row of rows as any[][]) {

    if (!row[0]) continue; // Skip empty rows

    const applicationDate = excelDateToJSDate(row[16]);
    const stepDate = excelDateToJSDate(row[19]);
    const deadline = excelDateToJSDate(row[21]);
    const dateFound = excelDateToJSDate(row[15]);

    // Construct the steps array
    const initialSteps = [];
    if (row[18]) { // Current Step
      initialSteps.push({
        type: 'STEP',
        isStep: true,
        date: stepDate || applicationDate || new Date(),
        description: `${row[18]}: ${row[24] || ''}`.trim()
      });
    }

    await prisma.application.create({
      data: {
        excelId: String(row[0]),
        name: row[1],
        initiator: row[2],
        feel: row[3],
        status: row[4] || 'Unknown',
        company: row[5] || 'Unknown',
        recruiterCo: row[6],
        role: row[7] || 'Unknown',
        link: row[8],
        avgGrossSal: row[9] ? String(row[9]) : null,
        avgNetSal: row[10] ? String(row[10]) : null,
        jobType: row[11],
        duration: row[12],
        mainRecruiter: row[13],
        recruiterContact: row[14],
        dateFound: dateFound,
        applicationDate: applicationDate,
        locationType: row[17],
        currentStep: row[18],
        stepDate: stepDate,
        nextAction: row[20],
        deadline: deadline,
        currentInterviewer: row[22],
        interviewType: row[23],
        currentStepNotes: row[24],
        notes: row[25],
        finalFeedback: row[26],
        steps: JSON.stringify(initialSteps),
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

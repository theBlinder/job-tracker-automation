const XLSX = require("xlsx");
const fs = require("fs");

const fileName = "job_applications.xlsx";

function saveJob(job) {
let workbook;
let data = [];


if (fs.existsSync(fileName)) {
  workbook = XLSX.readFile(fileName);
  const existingWorksheet = workbook.Sheets["Applications"];
  data = XLSX.utils.sheet_to_json(existingWorksheet);

} else {
  workbook = XLSX.utils.book_new();
}

if (!job.Company.trim() || !job.Job_id.trim()) {
  console.log("Company and Job ID are mandatory.");
  process.exit();
}

const isDuplicate = data.some(existingJob =>
  existingJob.Job_link &&
  job.Job_link &&
  String(existingJob.Job_link).trim().toLowerCase() === String(job.Job_link).trim().toLowerCase()
);

if (isDuplicate) {
  console.log("Duplicate job found. This job was not added.");
  process.exit();
}

data.push(job);

const worksheet = XLSX.utils.json_to_sheet(data);

if (workbook.SheetNames.includes("Applications")) {
  workbook.Sheets["Applications"] = worksheet;
} else {
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
}

XLSX.writeFile(workbook, fileName);
 
console.log("Job saved successfully.");
}

module.exports = { saveJob };
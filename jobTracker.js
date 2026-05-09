const readline = require("readline-sync");
const XLSX = require("xlsx");
const fs = require("fs");
const fileName = "job_applications.xlsx";

const Company = readline.question("Enter company name: ");
const Role = readline.question("Enter job role: ");
const Exp_required= readline.question("Enter experience required:");
const Location = readline.question("Enter location: ");
const Skills = readline.question("Enter required skills: ");
const Work_mode = readline.question("Enter work mode: "); 
const job_id = readline.question("Enter job ID: ");
const applied = readline.question("Have you applied? Yes/No: ");
const referral_asked = readline.question("Asked for referral? Yes/No: ");

const job = {
  Company: Company,
  Role: Role,
  Exp_required: Exp_required,
  Location: Location,
  Skills: Skills,
  Work_mode: Work_mode,
  Job_id: job_id,
  Applied: applied,
  Referral_asked: referral_asked
};

let workbook;
let data = [];


if (fs.existsSync(fileName)) {
  workbook = XLSX.readFile(fileName);
  const existingWorksheet = workbook.Sheets["Applications"];
  data = XLSX.utils.sheet_to_json(existingWorksheet);
  console.log(data);
} else {
  workbook = XLSX.utils.book_new();
}

if (!job.Company.trim() || !job.Job_id.trim()) {
  console.log("Company and Job ID are mandatory.");
  process.exit();
}

const isDuplicate = data.some(existingJob =>
  existingJob.Company &&
  existingJob.Job_id &&
  String(existingJob.Company).trim().toLowerCase() === String(job.Company).trim().toLowerCase() &&
  String(existingJob.Job_id).trim().toLowerCase() === String(job.Job_id).trim().toLowerCase()
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

console.log(job);


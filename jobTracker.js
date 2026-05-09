const readline = require("readline-sync");
const XLSX = require("xlsx");
const fileName = "job_applications.xlsx";

const Company = readline.question("Enter company name: ");
const Role = readline.question("Enter job role: ");
const Exp_required= readline.question("Enter experience required:");
const Location = readline.question("Enter location: ");
const Skills = readline.question("Enter required skills: ");
const Work_mode = readline.question("Enter work mode: "); 

const job = {
  Company: Company,
  Role: Role,
  Exp_required: Exp_required,
  Location: Location,
  Skills: Skills,
  Work_mode: Work_mode

};

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet([job]);
XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
XLSX.writeFile(workbook, fileName);




console.log(job);


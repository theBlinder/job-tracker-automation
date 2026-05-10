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
const { saveJob } = require("./excelService");

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

saveJob(job);




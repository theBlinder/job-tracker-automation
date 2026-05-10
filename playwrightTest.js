const { chromium } = require("playwright");
const { saveJob } = require("./excelService");
const readline = require("readline-sync");
const jobUrl = readline.question("Enter job URL: ");


 

async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(jobUrl);

  const pageTitle = await page.title();

const bodyText = await page.locator("body").innerText();

const lines = bodyText.split("\n");

const jobData = {
  Company: "To be confirmed",
  Role: pageTitle,
  Exp_required: "Not specified",
  Location: "Not specified",
  Skills: "Not specified",
  Work_mode: "Not specified",
  Job_id: readline.question("Enter actual Job ID if available: "),
Job_link: jobUrl,
  Applied: "No",
  Referral_asked: "No"
};


saveJob(jobData);

  await browser.close();
}

openBrowser();
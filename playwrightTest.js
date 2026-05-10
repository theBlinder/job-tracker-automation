const { chromium } = require("playwright");
const { saveJob } = require("./excelService");
const readline = require("readline-sync");
const { detectJobIdFromUrl, detectWorkMode } = require("./jobParser");
const jobUrl = readline.question("Enter job URL: ");


async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(jobUrl, { waitUntil: "domcontentloaded" });

  const pageTitle = await page.title();

const bodyText = await page.locator("body").innerText();

const lines = bodyText.split("\n");

const detectedJobId = detectJobIdFromUrl(jobUrl);

const detectedWorkMode = detectWorkMode(bodyText);

const jobData = {
  Company: readline.question("Enter company name: "),
  Role: readline.question(`Detected role/title is "${pageTitle}". Press Enter to accept or type correct role: `) || pageTitle,
  Exp_required: readline.question("Enter experience required (if known): "),
  Location: readline.question("Enter location: "),
  Skills: readline.question("Enter important skills (comma separated): "),
  Work_mode: readline.question(`Detected work mode is "${detectedWorkMode}". Press Enter to accept or type correct value: `) || detectedWorkMode,
  Job_id: readline.question(`Detected Job ID is "${detectedJobId}". Press Enter to accept or type correct Job ID: `) || detectedJobId,
  Job_link: jobUrl,
  Applied: readline.question("Have you applied? Yes/No: "),
  Referral_asked: readline.question("Asked for referral? Yes/No: ")
};


saveJob(jobData);

  await browser.close();
}

openBrowser();
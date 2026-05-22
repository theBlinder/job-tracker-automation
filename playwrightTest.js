const { chromium } = require("playwright");
const { saveJob } = require("./excelService");
const { saveToGoogleSheet } = require("./googleSheetService");
const readline = require("readline-sync");

const {
  detectJobIdFromUrl,
  detectCompanyFromUrl,
  detectPageType,
  detectRoleFromUrl
} = require("./jobParser");

const jobUrl = readline.question("Enter job URL: ");

function askWithSuggestion(label, suggestedValue) {
  if (!suggestedValue) {
    return readline.question(`Enter ${label}: `);
  }

  return (
    readline.question(
      `Detected ${label} is "${suggestedValue}". Press Enter to accept or type correct ${label}: `
    ) || suggestedValue
  );
}

async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(jobUrl, { waitUntil: "domcontentloaded" });

    const bodyText = await page.locator("body").innerText().catch(() => "");

    const pageType = detectPageType(jobUrl, bodyText);
    const detectedJobId = detectJobIdFromUrl(jobUrl);
    const detectedCompany = detectCompanyFromUrl(jobUrl);
    const detectedRole = detectRoleFromUrl(jobUrl);

    console.log("Detected page type:", pageType);

    const statusOptions = [
      "Saved",
      "Applied",
      "Referral Requested",
      "Interview Scheduled",
      "Rejected",
      "Offer"
    ];

    const statusIndex = readline.keyInSelect(statusOptions, "Select status:", {
      cancel: false
    });

    const jobData = {
      Company: askWithSuggestion("company", detectedCompany),
      Role: askWithSuggestion("role/title", detectedRole),
      Status: statusOptions[statusIndex],
      Exp_required: readline.question("Enter experience required: "),
      Location: readline.question("Enter location: "),
      Skills: readline.question("Enter important skills, comma separated: "),
      Work_mode: readline.question("Enter work mode, if known: "),
      Job_id: askWithSuggestion("Job ID", detectedJobId),
      Job_link: jobUrl,
      Applied: readline.question("Have you applied? Yes/No: "),
      Referral_asked: readline.question("Asked for referral? Yes/No: "),
      Posted: readline.question("Enter posting date, if known: ")
    };

    saveJob(jobData);
    await saveToGoogleSheet(jobData);
  } finally {
    await browser.close();
  }
}

openBrowser();

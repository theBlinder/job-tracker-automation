const readline = require("readline-sync");
const { chromium } = require("playwright");
const { saveJob } = require("./excelService");

const {
  detectCompanyFromUrl,
  detectCompanyFromPage,
  extractRole,
  extractLocation,
  detectWorkMode,
  detectJobIdFromUrl,
  detectPageType,
  detectExperience,
  detectPostedDate
} = require("./jobParser");

async function run() {
  const jobLink = readline.question("Enter job link: ");

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(jobLink, {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });

    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    const bodyText = await page.locator("body").innerText();

    const pageType = detectPageType(jobLink, bodyText);

    if (pageType === "listing") {
      console.log("This looks like a job listing/search page, not a job detail page.");
      console.log("Please open a specific job detail page and try again.");
      await browser.close();
      return;
    }

    const companyFromUrl = detectCompanyFromUrl(jobLink);
    const role = await extractRole(page, jobLink, pageTitle, bodyText);
    const location = await extractLocation(page, jobLink, bodyText);

    const extractedJob = {
      Company: detectCompanyFromPage(bodyText, companyFromUrl),
      Role: role,
      Exp_required: detectExperience(bodyText),
      Location: location,
      Skills: "",
      Work_mode: detectWorkMode(bodyText),
      Job_id: detectJobIdFromUrl(jobLink),
      Posted_date: detectPostedDate(bodyText),
      Job_link: jobLink
    };

    console.log("\nExtracted Job Details:");
    console.log(extractedJob);

    const confirmSave = readline.question("\nSave this job? Yes/No: ");

    if (confirmSave.toLowerCase() === "yes") {
      saveJob(extractedJob);
      console.log("Job saved successfully.");
    } else {
      console.log("Job not saved.");
    }

  } catch (error) {
    console.error("Extraction failed:", error.message);
  } finally {
    await browser.close();
  }
}

run();

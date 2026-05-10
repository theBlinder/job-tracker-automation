const { chromium } = require("playwright");
const { saveJob } = require("./excelService");
const readline = require("readline-sync");
const {
  detectJobIdFromUrl,
  detectWorkMode,
  detectCompanyFromUrl,
  detectLocation,
  detectPageType
} = require("./jobParser");

const jobUrl = readline.question("Enter job URL: ");

async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(jobUrl, { waitUntil: "domcontentloaded" });

  const pageTitle = await page.title();
  const bodyText = await page.locator("body").innerText();

  const pageType = detectPageType(jobUrl, bodyText);
  const detectedJobId = detectJobIdFromUrl(jobUrl);
  const detectedWorkMode = detectWorkMode(bodyText);
  const detectedCompany = detectCompanyFromUrl(jobUrl);
  const detectedLocation = detectLocation(bodyText);

  console.log("Detected page type:", pageType);

  if (pageType === "listing") {
    const firstJobCardText = await page
      .getByRole("button", { name: /View job:/ })
      .first()
      .innerText();

    const cardLines = firstJobCardText.split("\n");

    const listingJobData = {
      Company: detectedCompany,
      Role: cardLines[0] || "",
      Exp_required: "Not specified",
      Location: cardLines[1] || "",
      Skills: "Not specified",
      Work_mode: detectedWorkMode || "Not specified",
      Job_id: readline.question(`Detected Job ID is "${detectedJobId}". Press Enter to accept or type correct Job ID: `) || detectedJobId,
      Job_link: jobUrl,
      Applied: readline.question("Have you applied? Yes/No: "),
      Referral_asked: readline.question("Asked for referral? Yes/No: "),
      Posted: cardLines[2] || ""
    };

    saveJob(listingJobData);

    await browser.close();
    return;
  }

  const jobData = {
    Company: readline.question(`Detected company is "${detectedCompany}". Press Enter to accept or type correct company: `) || detectedCompany,
    Role: readline.question(`Detected role/title is "${pageTitle}". Press Enter to accept or type correct role: `) || pageTitle,
    Exp_required: readline.question("Enter experience required (if known): "),
    Location: readline.question(`Detected location is "${detectedLocation}". Press Enter to accept or type correct location: `) || detectedLocation,
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
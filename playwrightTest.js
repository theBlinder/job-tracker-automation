const { chromium } = require("playwright");
const { saveJob } = require("./excelService");
const { saveToGoogleSheet } = require("./googleSheetService");
const readline = require("readline-sync");

const 
{
  detectJobIdFromUrl,
  detectWorkMode,
  detectCompanyFromUrl,
  detectCompanyFromPage,
  detectLocation,
  detectPageType,
  detectRoleFromPage,
  detectRoleFromUrl
} = require("./jobParser");

const jobUrl = readline.question("Enter job URL: ");

async function openBrowser() 
{
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(jobUrl, { waitUntil: "domcontentloaded" });

  const pageTitle = await page.title();
  const bodyText = await page.locator("body").innerText();

  const pageType = detectPageType(jobUrl, bodyText);
  const detectedJobId = detectJobIdFromUrl(jobUrl);
  const detectedWorkMode = detectWorkMode(bodyText);
  const detectedCompanyFromUrl = detectCompanyFromUrl(jobUrl);
  const detectedCompanyFromPage = detectCompanyFromPage(bodyText, detectedCompanyFromUrl);
  const detectedLocation = detectLocation(bodyText);
  const detectedRole =
  detectRoleFromUrl(jobUrl) || detectRoleFromPage(pageTitle, bodyText, jobUrl);

  console.log("Detected page type:", pageType);

  if (pageType === "listing") 
    {
    const firstJobCardText = await page
      .getByRole("button", { name: /View job:/ })
      .first()
      .innerText();

    const cardLines = firstJobCardText.split("\n");

    const listingRole = cardLines[0] || detectedRole;
    const listingLocation = cardLines[1] || detectedLocation;
    const listingPosted = cardLines[2] || "";

    const listingJobData = 
    {
      Company: readline.question(`Detected company is "${detectedCompanyFromPage}". Press Enter to accept or type correct company: `) || detectedCompanyFromPage,
      Role: readline.question(`Detected role/title is "${listingRole}". Press Enter to accept or type correct role: `) || listingRole,
      Exp_required: readline.question("Enter experience required (if known): "),
      Location: readline.question(`Detected location is "${listingLocation}". Press Enter to accept or type correct location: `) || listingLocation,
      Skills: readline.question("Enter important skills (comma separated): "),
      Work_mode: readline.question(`Detected work mode is "${detectedWorkMode}". Press Enter to accept or type correct value: `) || detectedWorkMode,
      Job_id: readline.question(`Detected Job ID is "${detectedJobId}". Press Enter to accept or type correct Job ID: `) || detectedJobId,
      Job_link: jobUrl,
      Applied: readline.question("Have you applied? Yes/No: "),
      Referral_asked: readline.question("Asked for referral? Yes/No: "),
      Posted: listingPosted
    };

    saveJob(listingJobData);
    await saveToGoogleSheet(listingJobData);

    await browser.close();
    return;
  }

  const jobData = 
  {
    Company: readline.question(`Detected company is "${detectedCompanyFromPage}". Press Enter to accept or type correct company: `) || detectedCompanyFromPage,
    Role: readline.question(`Detected role/title is "${detectedRole}". Press Enter to accept or type correct role: `) || detectedRole,
    Exp_required: readline.question("Enter experience required (if known): "),
    Location: readline.question(`Detected location is "${detectedLocation}". Press Enter to accept or type correct location: `) || detectedLocation,
    Skills: readline.question("Enter important skills (comma separated): "),
    Work_mode: readline.question(`Detected work mode is "${detectedWorkMode}". Press Enter to accept or type correct value: `) || detectedWorkMode,
    Job_id: readline.question(`Detected Job ID is "${detectedJobId}". Press Enter to accept or type correct Job ID: `) || detectedJobId,
    Job_link: jobUrl,
    Applied: readline.question("Have you applied? Yes/No: "),
    Referral_asked: readline.question("Asked for referral? Yes/No: "),
    Posted: readline.question("Enter posting date (if known): ")
  };

  saveJob(jobData);
  await saveToGoogleSheet(jobData);

  await browser.close();
}

openBrowser();
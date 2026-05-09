const { chromium } = require("playwright");

async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://careers.microsoft.com/us/en/search-results");

  const pageTitle = await page.title();


const jobCardText = await page
  .getByRole('button', { name: /View job:/ })
  .first()
  .innerText();

const lines = jobCardText.split("\n");

const jobData = {
  title: lines[0],
  location: lines[1],
  posted: lines[2]
};

console.log(jobData);

// console.log(lines);


  await browser.close();
}

openBrowser();
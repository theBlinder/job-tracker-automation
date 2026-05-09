const { chromium } = require("playwright");

async function openBrowser() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto("https://example.com");

  console.log("Page opened successfully");

  await browser.close();
}

openBrowser();
🚧 Project currently under active development.

# Job Tracker Automation

Job Tracker Automation is a lightweight job-application tracker with two stable workflows:

1. A hosted GitHub Pages web form for quick desktop or mobile entry.
2. A local Playwright terminal flow that opens a job link, suggests detected values, and saves the record locally.

Hosted form: https://theblinder.github.io/job-tracker-automation/

## What It Does

- Records job applications with company, role, experience, location, skills, work mode, job ID, job link, application status, referral status, and posted date.
- Submits the hosted form to Google Apps Script, which writes to Google Sheets.
- Keeps access-key validation in Google Apps Script instead of trusting browser-side checks.
- Auto-fills the Job ID field from common job-link URL patterns.
- Prevents duplicate records in Google Sheets through the Apps Script backend.
- Supports local Excel saving through the Playwright terminal flow.

## Project Structure

```text
job-tracker-automation/
|-- index.html              # Hosted responsive web form
|-- playwrightTest.js       # Local Playwright terminal workflow
|-- jobParser.js            # Job URL parsing helpers
|-- excelService.js         # Local Excel saving and duplicate checks
|-- googleSheetService.js   # Optional Google Sheets sync for terminal flow
|-- jobTracker.js           # Basic manual terminal entry flow
|-- package.json            # Node.js dependencies
`-- README.md
```

## Hosted Web Form

The web form is designed for fast manual entry from desktop or mobile.

Use it here:

https://theblinder.github.io/job-tracker-automation/

The form posts job data to a deployed Google Apps Script web app. The Apps Script endpoint is responsible for validating the access key, checking for duplicates, and writing accepted records to Google Sheets.

When a job link is entered, the form tries to detect a Job ID from the URL path or known query parameters. If a match is found, the Job ID field is filled automatically.

## Mobile Usage

The hosted form is responsive and works as a single-column layout on smaller screens. This makes it usable directly from a phone while browsing job postings.

Typical mobile flow:

1. Open the hosted form.
2. Paste the job link.
3. Review or edit the auto-filled Job ID.
4. Fill the required fields.
5. Enter the access key.
6. Submit the job.

## Google Apps Script + Google Sheets

Google Sheets integration is handled by Google Apps Script.

The browser form sends a JSON payload to the Apps Script web app URL configured in `index.html`.

The Apps Script backend should handle:

- Access-key validation
- Duplicate prevention
- Writing valid job records to Google Sheets
- Returning a JSON response to the form

The local Playwright flow can also submit to Google Sheets when `GOOGLE_SCRIPT_URL` is configured.

Create a `.env` file:

```env
GOOGLE_SCRIPT_URL=your-google-apps-script-web-app-url
```

If `GOOGLE_SCRIPT_URL` is not set, the Playwright flow still saves to the local Excel file and skips Google Sheets sync.

## Local Playwright Terminal Flow

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run the Playwright workflow:

```bash
node playwrightTest.js
```

Flow:

1. Paste a job URL in the terminal.
2. Playwright opens the page in Chromium.
3. The script attempts to detect page type, company, role, and Job ID.
4. The terminal asks you to accept or correct detected values.
5. The record is saved to `job_applications.xlsx`.
6. If configured, the record is also sent to Google Apps Script.

The local Excel flow prevents duplicate entries by comparing existing job links before saving.

## Basic Manual Terminal Flow

Run:

```bash
node jobTracker.js
```

This provides a simpler manual-entry terminal flow.

## Tech Stack

- HTML, CSS, and browser `fetch`
- JavaScript
- Node.js
- Playwright
- XLSX
- Axios
- dotenv
- readline-sync
- Google Apps Script
- Google Sheets

## Known Limitations

- Job detail detection depends on each job portal's URL format and page structure.
- The Playwright flow still needs manual review and correction.
- The hosted form depends on the deployed Apps Script endpoint being available.
- Browser-side Job ID detection is best-effort and may not work for every posting.
- Access-key validation and Google Sheets duplicate prevention are enforced in Apps Script, so the backend must stay in sync with the form fields.
- Automated tests are not currently included.
- The repository includes local Excel storage, but Google Sheets is the primary hosted-form storage path.

## License

ISC

Project currently under active development.

# Job Tracker Automation

Job Tracker Automation is a lightweight job-application tracker with three stable workflows:

1. A hosted GitHub Pages web form for quick desktop or mobile entry.
2. A one-time saved bookmarklet that extracts details from the current job page and opens the tracker in a new tab.
3. Optional local Playwright tools for pasted-link extraction and terminal workflows.

Hosted form: https://theblinder.github.io/job-tracker-automation/

## What It Does

- Records job applications with company, role, experience, location, skills, work mode, job ID, job link, application status, and referral status.
- Submits the hosted form to Google Apps Script, which writes accepted records to Google Sheets.
- Keeps access-key validation in Google Apps Script instead of trusting browser-side checks.
- Auto-fills the Job ID field from common job-link URL patterns.
- Extracts visible job details through the saved bookmarklet without requiring localhost.
- Opens the tracker in a new tab from the bookmarklet so the original job page stays open.
- Supports local Excel saving through the Playwright terminal flow.
- Supports optional local Google Sheets append through the Google Sheets API.

## Project Structure

```text
job-tracker-automation/
|-- index.html              # Hosted responsive web form and bookmarklet
|-- server.js               # Optional local Express + Playwright extraction API
|-- playwrightTest.js       # Local Playwright terminal workflow
|-- jobParser.js            # Job extraction and parsing helpers
|-- excelService.js         # Local Excel saving and duplicate checks
|-- googleSheetService.js   # Optional Google Sheets API append flow
|-- testGoogleSheet.js      # Local Google Sheets append smoke test
|-- jobTracker.js           # Basic manual terminal entry flow
|-- package.json            # Node.js dependencies
`-- README.md
```

## Hosted Web Form

The web form is designed for fast manual entry from desktop or mobile.

Use it here:

```text
https://theblinder.github.io/job-tracker-automation/
```

The hosted form posts job data to the deployed Google Apps Script web app configured in `index.html`. The Apps Script endpoint validates the access key, checks duplicates, and writes accepted records to Google Sheets.

When a job link is entered, the form tries to detect a Job ID from the URL path or known query parameters. If a match is found, the Job ID field is filled automatically.

The pasted-link extraction button is hidden on the hosted tracker. It appears only when running the tracker locally because that workflow needs the optional local server.

## Bookmarklet Flow

Open the hosted tracker once and save the `Extract Job` bookmarklet to your browser bookmarks.

After it is saved, use it like this:

1. Open a job posting page.
2. Click the saved `Extract Job` bookmark.
3. The tracker opens in a new tab with extracted values in the form.
4. Review the fields before saving.

The bookmarklet extracts only from details that are visible or available in the job page markup. If a field is uncertain, the safer behavior is to leave it blank instead of filling a wrong value.

Some mobile browsers and job sites restrict bookmarklet execution, so desktop bookmarks are the most reliable path.

## Mobile Usage

The hosted form is responsive and works as a single-column layout on smaller screens.

Typical mobile flow:

1. Open the hosted form.
2. Paste the job link.
3. Review or edit the auto-filled Job ID.
4. Fill the required fields.
5. Enter the access key.
6. Submit the job.

## Google Sheets

There are two Google Sheets paths in the project:

- Hosted form path: `index.html` submits to Google Apps Script.
- Local terminal path: `googleSheetService.js` appends through the Google Sheets API using service-account values from `.env`.

For the local Google Sheets API flow, create a `.env` file:

```env
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY="your-service-account-private-key"
GOOGLE_SHEET_NAME=Google Sync
```

`GOOGLE_SHEET_NAME` is optional. If it is not set, the local sync uses `Google Sync`.

The service account must have access to the target Google Sheet.

The Google Sheets append order matches the Excel-style field structure:

```text
Company, Role, Exp_required, Location, Skills, Work_mode, Job_id, Job_link, Applied, Referral_asked, Status, Notes, Created_at
```

To run the local Google Sheets smoke test:

```bash
node testGoogleSheet.js
```

## Local Playwright Terminal Flow

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Optional: run the local extraction web server for pasted-link extraction on desktop:

```bash
npm start
```

Then open:

```text
http://localhost:3000/
```

Run the Playwright workflow:

```bash
node playwrightTest.js
```

Flow:

1. Paste a job URL in the terminal.
2. Playwright opens the page in Chromium.
3. The script attempts to detect page type, company, role, location, and Job ID.
4. The terminal asks you to accept or correct detected values.
5. The record is saved to `job_applications.xlsx`.
6. If configured, the record can also be appended to Google Sheets.

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
- googleapis
- readline-sync
- Google Apps Script
- Google Sheets

## Known Limitations

- Job detail detection depends on each job portal's URL format and page structure.
- Bookmarklet extraction depends on details already being visible or present in the current job page.
- Some sites block or limit bookmarklet access.
- Pasted-link extraction requires the optional local Playwright server to be running.
- The Playwright flow still needs manual review and correction.
- The hosted form depends on the deployed Apps Script endpoint being available.
- Browser-side Job ID detection is best-effort and may not work for every posting.
- Automated tests are not currently included.

## License

ISC

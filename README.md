🚧 Project currently under active development.

# Job Tracker Automation

Job Tracker Automation is a Node.js and web-form project for recording job applications in a consistent format. It helps reduce the manual work of copying job links, job IDs, company names, roles, referral status, and application status into a spreadsheet after each application.

## Problem Statement

During an active job search, application details are often spread across browser tabs, job portals, notes, and spreadsheets. This makes it easy to lose track of which roles were applied to, which links need follow-up, and whether a referral was requested.

This project exists to make that tracking process more reliable and less repetitive while keeping the data in a Google Sheet or local Excel file.

## Current Architecture

The project currently supports two workflows for recording job applications:

1. A Playwright-based terminal workflow that opens a job URL, suggests some detected values, asks for confirmation, saves to Excel, and can also sync to Google sheets.
2. A hosted responsive web form that submits job application details directly to a Google Apps Script endpoint connected to Google Sheets.

```text
job-tracker-automation/
|-- index.html              # Responsive hosted web form
|-- playwrightTest.js       # Playwright terminal automation flow
|-- jobParser.js            # URL and page-detail detection helpers
|-- excelService.js         # Local Excel storage and duplicate checks
|-- googleSheetService.js   # Optional Google Sheets sync for terminal flow
|-- jobTracker.js           # Basic manual terminal entry flow
|-- package.json            # Node.js dependencies
`-- README.md
```

## Usage Flow 1: Playwright Terminal Automation

The terminal flow is useful when you want the app to open a job posting and assist with data entry.

How it works:

1. Run the Playwright script.
2. Paste a job URL in the terminal.
3. Playwright opens the page in Chromium.
4. The parser attempts to detect the page type, company, role, and job ID from the URL and page content.
5. The terminal prompts you to accept or correct detected values.
6. The record is saved to `job_applications.xlsx`.
7. If `GOOGLE_SCRIPT_URL` is configured, the same record is also submitted to Google Sheets.

## Usage Flow 2: Hosted Web Form

The hosted form can be used from desktop or mobile browsers.
The hosted form in `index.html` is designed for quick manual entry from a browser. It can be deployed as a static page and connected to a Google Apps Script web app.

The form captures:

- Company
- Role
- Experience required
- Location
- Skills
- Work mode
- Job ID
- Job link
- Applied status
- Referral status
- Posted date
- Access key

When a job link is pasted into the form, the page attempts to detect a Job ID from the URL path or common query parameters. If the Job ID field is empty, it is filled automatically when the job link field loses focus.

The UI is responsive and adapts from a two-column desktop layout to a single-column mobile layout.

## Google Sheets Integration

Google Sheets integration is handled through a deployed Google Apps Script web app.

For the terminal flow, set `GOOGLE_SCRIPT_URL` in your environment or `.env` file:

```env
GOOGLE_SCRIPT_URL=your-google-apps-script-web-app-url
```

If the variable is not set, the terminal flow still saves records locally to Excel and skips Google Sheets sync.

For the hosted web form, `index.html` sends a JSON payload to the configured Apps Script URL using `fetch`.

## Access-Key Protected Submissions

The hosted form includes an `Access_key` field. This value is submitted with the job data so the Google Apps Script endpoint can validate the request before writing to the sheet.

Access-key validation should be enforced in the Apps Script backend, not only in the browser.

## Setup

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Create a `.env` file if you want terminal submissions to sync with Google Sheets:

```env
GOOGLE_SCRIPT_URL=your-google-apps-script-web-app-url
```

Run the Playwright terminal flow:

```bash
node playwrightTest.js
```

Run the basic manual terminal flow:

```bash
node jobTracker.js
```

To use the hosted form, deploy `index.html` with any static hosting provider and configure its `SCRIPT_URL` value to point to your deployed Google Apps Script endpoint.

## Tech Stack

- JavaScript
- Node.js
- Playwright
- XLSX
- Axios
- dotenv
- readline-sync
- HTML, CSS, and browser `fetch`
- Google Sheets through Google Apps Script

## Known Limitations

- Job detail detection depends on each job portal's URL and page structure.
- The Playwright flow still requires user confirmation and manual correction.
- The hosted form relies on the Google Apps Script endpoint for validation and sheet writes.
- Automated tests are not currently included.

## License

ISC

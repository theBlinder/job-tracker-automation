# Project Context: Job Tracker Automation

Last reviewed: 2026-05-24

## 1. What This Project Is

Job Tracker Automation is a lightweight job application tracking system. Its goal is to make it easy to save job opportunities while browsing job sites, then store those applications in Google Sheets or a local Excel file.

The project currently supports three main usage paths:

1. Hosted web form on GitHub Pages for quick manual entry.
2. Browser bookmarklet that extracts visible job details from the current job page and opens the hosted tracker with fields prefilled.
3. Local Node.js tools using Playwright for extraction, terminal review, Excel saving, and optional Google Sheets API syncing.

The hosted form is the main user-facing workflow. The local scripts are helper workflows for testing, extraction, and local storage.

Hosted tracker:

```text
https://theblinder.github.io/job-tracker-automation/
```

## 2. Current High-Level Architecture

The project is a small JavaScript/Node.js application with no frontend build step.

```text
Browser / GitHub Pages
  |
  | index.html
  | - responsive job tracker form
  | - bookmarklet generator
  | - browser-side Job ID detection
  | - submits JSON to Google Apps Script
  v
Google Apps Script
  |
  | - validates access key
  | - checks duplicates
  | - writes accepted rows
  v
Google Sheets
```

Optional local flow:

```text
Terminal or local browser
  |
  | npm start / node scripts
  v
server.js
  |
  | POST /extract
  v
jobParser.js + Playwright
  |
  | extracted job details
  v
index.html local form or terminal script
  |
  +-> excelService.js -> job_applications.xlsx
  |
  +-> googleSheetService.js -> Google Sheets API
```

## 3. Repository Structure

```text
job-tracker-automation/
|-- index.html              # Hosted responsive form, bookmarklet, browser behavior
|-- server.js               # Optional local Express API for pasted-link extraction
|-- jobParser.js            # Shared job detail extraction and parsing logic
|-- excelService.js         # Local Excel persistence and duplicate check
|-- googleSheetService.js   # Local Google Sheets API append/check helpers
|-- playwrightTest.js       # Local Playwright terminal workflow
|-- jobTracker.js           # Older/basic terminal workflow
|-- testGoogleSheet.js      # Google Sheets API smoke test
|-- README.md               # Public project overview and usage guide
|-- package.json            # Node dependencies and scripts
|-- package-lock.json       # Locked dependency versions
|-- .env                    # Local secrets/config, ignored by git
|-- .gitignore              # Ignores secrets, node_modules, and Excel output
`-- job_applications.xlsx   # Local Excel data file, ignored by git
```

## 4. Main Data Model

The project tracks one row per job application/opportunity.

Current core fields:

```text
Access_key
Company
Role
Exp_required
Location
Skills
Work_mode
Job_id
Job_link
Entry_type
Applied
Status
Referral_asked
Notes
Created_at
```

The Google Sheets API helper uses this column order:

```text
Company, Role, Exp_required, Location, Skills, Work_mode, Job_id, Job_link, Applied, Referral_asked, Status, Notes, Created_at
```

The hosted browser form includes `Access_key` because Google Apps Script validates the submission. The local Google Sheets API path does not need the access key because it authenticates using a Google service account.

## 5. Hosted Web Form Workflow

File:

```text
index.html
```

The hosted form is the primary UI. It is a single static HTML file containing CSS, markup, and browser JavaScript.

What the form does:

1. Shows a responsive two-column desktop layout and single-column mobile layout.
2. Captures job details from the user.
3. Auto-detects `Job_id` from the pasted `Job_link` when possible.
4. Sends the form as JSON to a deployed Google Apps Script URL.
5. Shows success/error status messages.
6. Keeps the access key in the form after a successful reset so repeated entries are faster.
7. Hides the pasted-link extraction button on the hosted site because `/extract` only exists when the local server is running.

Important browser constants:

```text
SCRIPT_URL  = deployed Google Apps Script web app endpoint
TRACKER_URL = https://theblinder.github.io/job-tracker-automation/
```

Submit behavior:

```text
User fills form
  -> index.html builds jobData from FormData
  -> fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(jobData) })
  -> Google Apps Script validates and stores
  -> index.html shows result.message or success message
```

The browser does not perform trusted validation beyond required form fields. Access-key validation and duplicate prevention are expected to happen in Google Apps Script.

## 6. Bookmarklet Workflow

The hosted form includes a bookmarklet link named `Extract Job`.

Current user flow:

1. Open the hosted tracker once.
2. Save the `Extract Job` bookmarklet to browser bookmarks.
3. Open a specific job posting page.
4. Click the saved bookmark.
5. The bookmarklet reads visible page content and metadata from that job page.
6. It opens the hosted tracker in a new tab with extracted fields in URL query parameters.
7. `index.html` reads those query parameters and fills matching form fields.
8. The user reviews the values and saves the job.

The bookmarklet extracts:

```text
Company
Role
Location
Exp_required
Job_id
Skills
Work_mode
Job_link
```

The bookmarklet deliberately uses conservative validation:

1. It rejects likely navigation, login, apply, privacy, search-result, and ATS noise text.
2. It prefers visible selectors, labels, metadata, title parts, and URL patterns.
3. It leaves fields blank when it is not confident.

This is important because a blank field is safer than an incorrect company or role.

Known limitation: bookmarklets depend on the browser and target job site allowing JavaScript to read page content. Some mobile browsers and job portals restrict this.

## 7. Local Express Extraction Workflow

File:

```text
server.js
```

Run with:

```bash
npm start
```

This starts an Express server at:

```text
http://localhost:3000/
```

The server:

1. Serves the project directory as static files, including `index.html`.
2. Enables simple CORS headers.
3. Exposes `POST /extract`.
4. Receives `{ jobLink }`.
5. Calls `extractJobDetails(jobLink)` from `jobParser.js`.
6. Returns `{ success: true, data: extractedData }` or an error response.

Local extraction flow:

```text
Open http://localhost:3000/
  -> paste job link
  -> click "Extract from pasted link"
  -> index.html POSTs to /extract
  -> server.js uses Playwright through jobParser.js
  -> extracted fields are placed into the form
```

This path is hidden on the hosted tracker because GitHub Pages cannot run the Express endpoint.

## 8. Job Parsing and Extraction Logic

File:

```text
jobParser.js
```

This is the main extraction brain of the project.

It uses Playwright when extracting from a pasted URL locally. It also exports smaller detection helpers used by terminal scripts.

Major responsibilities:

1. Open job pages with Chromium.
2. Wait for initial DOM content and visible text.
3. Detect whether a URL/page looks like a listing page or a job detail page.
4. Extract company, role, location, job ID, skills, experience, and work mode.
5. Clean noisy values.
6. Avoid common ATS/platform names being mistaken as companies.
7. Prefer confident values and log where values came from.

Extraction sources, generally in priority order:

1. Specific visible CSS selectors, such as job title, company, location, job ID, and skill-related selectors.
2. Metadata tags, such as `job:title`, `og:title`, `job:company`, `keywords`, and description fields.
3. Text near known labels, such as `Company:`, `Job ID:`, `Location:`, `Required skills:`.
4. URL query parameters, such as `jobId`, `reqId`, `requisitionId`, `jobReferenceCode`.
5. URL path patterns for job IDs.
6. Page title fallback.
7. Body text fallback for experience, work mode, posted date, and known skills.

Important validation concepts:

```text
ATS_NOISE_TERMS       # Workday, Greenhouse, Lever, Ashby, Oracle, etc.
FIELD_NOISE_PHRASES   # apply, login, privacy, search results, navigation, etc.
ROLE_WORDS            # engineer, analyst, developer, qa, tester, manager, etc.
KNOWN_SKILLS          # JavaScript, SQL, Selenium, Playwright, Postman, Jira, etc.
```

The parser currently tries to avoid false positives by requiring:

1. Company values to look like company names, not ATS names, job titles, or navigation labels.
2. Role values to include role-like words or recognized role phrases.
3. Location values to avoid long job-description text.
4. Job IDs to have plausible length and structure.

Main exported functions:

```text
detectJobIdFromUrl
detectWorkMode
detectCompanyFromUrl
detectCompanyFromPage
detectLocation
extractLocation
detectPageType
detectRoleFromPage
detectRoleFromUrl
extractRole
detectExperience
detectPostedDate
detectSkills
extractCompany
extractJobId
extractSkills
extractJobDetails
```

`extractJobDetails(jobLink)` returns:

```js
{
  company,
  role,
  location,
  experience,
  jobId,
  skills,
  workMode,
  jobLink
}
```

## 9. Local Excel Storage

File:

```text
excelService.js
```

Output file:

```text
job_applications.xlsx
```

The Excel service:

1. Opens `job_applications.xlsx` if it exists.
2. Reads the `Applications` sheet.
3. Requires `Company` and `Job_id`.
4. Checks duplicates by comparing normalized `Job_link`.
5. Appends the new job.
6. Writes the workbook back to disk.

Duplicate rule:

```text
Existing Job_link equals new Job_link after trim + lowercase
```

If a mandatory field is missing or a duplicate is found, the script logs a message and exits the process.

## 10. Local Google Sheets API Sync

File:

```text
googleSheetService.js
```

This is separate from the hosted Google Apps Script path. It is for local Node.js scripts that append directly to Google Sheets using a service account.

Required `.env` variables:

```env
GOOGLE_SHEET_ID=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

Optional:

```env
GOOGLE_SHEET_NAME=Google Sync
```

If `GOOGLE_SHEET_NAME` is not set, the service uses:

```text
Google Sync
```

The service:

1. Loads environment variables with `dotenv`.
2. Creates a Google Sheets API client with service account credentials.
3. Builds a row using the standard column order.
4. Appends the row to `SHEET_NAME!A:M`.
5. Can read existing rows.
6. Can check duplicates using either exact job link or company + role + job ID.

Duplicate rule for Google Sheets API helper:

```text
same normalized Job_link
OR
same normalized Company + Role + Job_id
```

Note: `saveToGoogleSheet(jobData)` currently appends directly and logs failures. It does not call `isDuplicateInGoogleSheet()` by itself. Any script that wants duplicate prevention through this helper must call that duplicate check before saving.

## 11. Terminal Workflows

### `playwrightTest.js`

Run:

```bash
node playwrightTest.js
```

Current flow:

1. Ask for a job URL.
2. Launch Chromium visibly with Playwright.
3. Open the job URL.
4. Read body text.
5. Detect page type, job ID, company, and role from URL/body.
6. Ask the user to accept or correct suggested values.
7. Ask for status, experience, location, skills, work mode, applied status, and referral status.
8. Save to Excel through `excelService.js`.
9. Attempt Google Sheets API append through `googleSheetService.js`.
10. Close the browser.

This is the most complete local terminal workflow.

### `jobTracker.js`

Run:

```bash
node jobTracker.js
```

This is an older/basic Playwright terminal flow.

Current behavior:

1. Ask for job link.
2. Open the page in visible Chromium.
3. Detect listing pages and stop if it appears to be a listing/search page.
4. Extract company, role, experience, location, work mode, job ID, posted date, and job link.
5. Show extracted object.
6. Ask whether to save.
7. Save to Excel if confirmed.

This script does not currently perform the same interactive correction flow as `playwrightTest.js`.

### `testGoogleSheet.js`

Run:

```bash
node testGoogleSheet.js
```

This appends a hardcoded test row to Google Sheets through `googleSheetService.js`. It is a smoke test for service account configuration.

## 12. Package and Dependencies

Package file:

```text
package.json
```

Available scripts:

```bash
npm start
```

There is no real automated test script yet. The current `npm test` script only exits with an error placeholder.

Dependencies:

```text
axios
dotenv
express
googleapis
playwright
readline-sync
xlsx
```

Notes:

1. `express` powers the optional local server.
2. `playwright` powers browser-based extraction.
3. `xlsx` handles local Excel storage.
4. `googleapis` handles direct local Google Sheets API access.
5. `dotenv` loads local secrets/config.
6. `readline-sync` powers terminal prompts.
7. `axios` is installed but not central to the current active code paths.

## 13. Security and Configuration

Ignored local files include:

```text
node_modules
job_applications.xlsx
~$job_applications.xlsx
.env
credentials.json
service-account.json
```

Current `.env` contains Google-related configuration. Secret values should not be committed or pasted into public docs.

The hosted form includes a public Apps Script URL in `index.html`. That is acceptable only if the Apps Script itself enforces:

1. Access-key validation.
2. Duplicate prevention.
3. Proper response handling.
4. Any required origin/rate controls.

The browser cannot be trusted to protect secrets. Anything placed in `index.html` is public.

## 14. Current Git/Working State

At review time, these files are modified in the working tree:

```text
README.md
index.html
jobParser.js
```

The recent direction appears to be:

1. Improve the README into a current project overview.
2. Improve the bookmarklet instructions and behavior.
3. Make bookmarklet extraction more conservative and useful.
4. Improve parser confidence checks to reduce wrong autofills.
5. Add direct Google Sheets API support for local terminal workflows.

This `PROJECT_CONTEXT.md` is intended to capture the full current state in one place.

## 15. What We Are Doing Now

The project has evolved from a simple local tracker into a hybrid hosted/local job tracking tool.

The current product direction is:

1. Use the hosted GitHub Pages form as the main everyday tracker.
2. Use Google Apps Script as the trusted hosted backend for validation and Google Sheets writes.
3. Use a bookmarklet to avoid needing localhost for normal extraction from job pages.
4. Keep local Playwright extraction as a stronger desktop fallback for pasted links.
5. Keep Excel saving as a local backup/offline path.
6. Keep direct Google Sheets API support for local terminal scripts and smoke testing.

In practical terms, the everyday intended user journey is:

```text
Find job posting
  -> click saved Extract Job bookmarklet
  -> hosted tracker opens with fields prefilled
  -> review/correct details
  -> enter access key
  -> save to Google Sheets through Apps Script
```

The local intended user journey is:

```text
Run npm start or node playwrightTest.js
  -> paste job URL
  -> Playwright extracts what it can
  -> user reviews/corrects values
  -> save to Excel and optionally Google Sheets
```

## 16. Known Limitations and Gaps

1. Automated tests are not implemented.
2. `npm test` is still a placeholder.
3. Extraction accuracy depends heavily on each job board's HTML, metadata, URL structure, and anti-automation behavior.
4. Bookmarklets can be blocked or limited by some sites and mobile browsers.
5. The hosted form depends on the deployed Apps Script endpoint staying available and compatible with the form fields.
6. `googleSheetService.js` has duplicate-check helpers, but `saveToGoogleSheet()` does not enforce them automatically.
7. Local Excel saving exits the whole process on validation failure or duplicate detection.
8. There are two parallel Google Sheets paths: Apps Script for hosted form and Google Sheets API for local scripts. They should stay aligned on columns and duplicate logic.
9. `GOOGLE_SCRIPT_URL` exists in `.env`, but the current active local Google Sheets helper uses service account variables instead.
10. Some UI/script formatting in `index.html` is uneven because the file combines CSS, markup, and a large bookmarklet string.

## 17. Recommended Next Steps

1. Add a small test suite for parser helpers such as `detectJobIdFromUrl`, `detectWorkMode`, `detectPageType`, `detectSkills`, and URL detection.
2. Make local Google Sheets saving call duplicate detection before append, or clearly document that callers must do it.
3. Align Apps Script columns and duplicate logic with `googleSheetService.js`.
4. Consider moving the long bookmarklet source into a separate source file and generating the minified string into `index.html`.
5. Add a sample Apps Script backend document or source file, excluding secrets.
6. Clean up terminal workflow naming so it is clear which local script is preferred.
7. Decide whether `jobTracker.js` is still needed or should be folded into `playwrightTest.js`.
8. Add basic linting/formatting so large files stay easier to maintain.

## 18. Quick Commands

Install dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

Run local web server:

```bash
npm start
```

Open local tracker:

```text
http://localhost:3000/
```

Run main local terminal workflow:

```bash
node playwrightTest.js
```

Run basic terminal workflow:

```bash
node jobTracker.js
```

Run Google Sheets API smoke test:

```bash
node testGoogleSheet.js
```

## 19. One-Sentence Summary

This project is now a hybrid job tracking system where a static hosted form and bookmarklet handle daily job capture into Google Sheets through Apps Script, while local Node.js and Playwright tools provide deeper extraction, Excel backup, and direct Google Sheets API support.

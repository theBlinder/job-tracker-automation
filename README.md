# Job Tracker Automation

Job Tracker Automation is a Node.js project that helps job seekers track applications without manually updating spreadsheets after every job they apply to.

The current version takes a job URL, opens it with browser automation, detects useful job details, asks the user to confirm the data, and saves the final record locally and optionally to Google Sheets.

## Why This Project Exists

When applying across many job portals, it is easy to lose track of:

- Job links and job IDs
- Company names and roles
- Application status
- Referral status
- Locations, skills, and work mode
- Duplicate applications

This project reduces that manual tracking effort and keeps job application records organized in one place.

## Current Features

- Opens job URLs using Playwright
- Detects job detail pages and basic listing pages
- Extracts or suggests company, role, location, work mode, and job ID
- Asks the user to confirm or correct detected values
- Saves records to `job_applications.xlsx`
- Prevents duplicate entries using the job link
- Optionally syncs records to Google Sheets

## Future Goal

The long-term goal is to turn this into a browser extension.

Instead of manually entering a job URL, the extension should automatically detect when the user is viewing a job posting, capture the job details from the page, and add the record directly to Google Sheets.

In that future version, Excel storage may be removed completely so users can manage everything from Google Sheets without maintaining a local file.

## Project Structure

```text
job-tracker-automation/
|-- playwrightTest.js        # Main browser automation workflow
|-- jobParser.js             # Job detail parsing and detection logic
|-- excelService.js          # Excel storage and duplicate checks
|-- googleSheetService.js    # Optional Google Sheets sync
|-- jobTracker.js            # Manual CLI-based tracker
|-- package.json             # Project dependencies
`-- README.md
```

## How It Works

1. The user runs the script.
2. The script asks for a job URL.
3. Playwright opens the page in Chromium.
4. The parser detects job details from the URL and page content.
5. The user confirms or corrects the detected values.
6. The record is saved to Excel.
7. If configured, the record is also sent to Google Sheets.

## Data Captured

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
- Posted date or posting information

## Setup

```bash
npm install
npx playwright install
```

## Usage

```bash
node playwrightTest.js
```

Then enter the job URL when prompted.

## Google Sheets Sync

Google Sheets sync is optional. Set `GOOGLE_SCRIPT_URL` to your deployed Google Apps Script web app URL.

PowerShell:

```powershell
$env:GOOGLE_SCRIPT_URL="your-google-apps-script-url"
node playwrightTest.js
```

Bash:

```bash
GOOGLE_SCRIPT_URL="your-google-apps-script-url" node playwrightTest.js
```

If `GOOGLE_SCRIPT_URL` is not set, the app skips Google Sheets sync and saves only to Excel.

## Tech Stack

- Node.js
- JavaScript
- Playwright
- XLSX
- Axios
- readline-sync

## Limitations

- Detection accuracy depends on each job portal's page structure.
- Listing page support is basic.
- The current version still needs user confirmation.
- Automated tests are not added yet.

## License

ISC

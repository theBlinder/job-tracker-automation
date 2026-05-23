🚧 Project currently under active development.

# Job Tracker Automation

Job Tracker Automation is a lightweight job-application tracker with three stable workflows:

1. A hosted GitHub Pages web form for quick desktop or mobile entry.
2. A no-backend bookmarklet flow that extracts details from the current job page and opens the hosted form.
3. Optional local Playwright tools for pasted-link extraction and terminal workflows.

Hosted form: https://theblinder.github.io/job-tracker-automation/

## What It Does

- Records job applications with company, role, experience, location, skills, work mode, job ID, job link, application status, and referral status.
- Submits the hosted form to Google Apps Script, which writes to Google Sheets.
- Keeps access-key validation in Google Apps Script instead of trusting browser-side checks.
- Auto-fills the Job ID field from common job-link URL patterns.
- Prevents duplicate records in Google Sheets through the Apps Script backend.
- Extracts job details from clear job pages through the bookmarklet without requiring localhost.
- Supports local Excel saving through the Playwright terminal flow.

## Project Structure

```text
job-tracker-automation/
|-- index.html              # Hosted responsive web form
|-- server.js               # Optional local Express + Playwright extraction API
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

The hosted form can receive extracted values from the bookmarklet through URL parameters. This works without localhost when the job page allows the bookmarklet to read visible page content before opening the tracker.

The pasted-link extraction button is hidden on the hosted tracker. It appears only when running the tracker locally because that workflow needs the optional local server.

## Bookmarklet Flow

Use this bookmarklet while you are on a job posting page. It extracts visible job details in the current browser tab, then opens the hosted tracker with the form pre-filled.

```javascript
javascript:(()=>{const c=v=>String(v||'').replace(/\s+/g,' ').replace(/^(company|employer|job title|title|role|position|location|job location|job id|requisition id|req id|skills|required skills|experience)\s*[:-]\s*/i,'').trim(),t=document.body?document.body.innerText:'',m=ns=>{for(const n of ns){const e=document.querySelector(`meta[name="${n}"],meta[property="${n}"]`);if(e&&c(e.content))return c(e.content)}return''},s=ss=>{for(const q of ss){const e=document.querySelector(q);if(e&&c(e.innerText||e.textContent))return c(e.innerText||e.textContent)}return''},l=ls=>{const a=[...document.querySelectorAll('body *')].slice(0,1200);for(const e of a){const x=c(e.innerText||e.textContent);if(!x||x.length>180)continue;const y=x.toLowerCase();for(const z of ls.map(v=>v.toLowerCase())){if(y===z&&e.nextElementSibling&&c(e.nextElementSibling.innerText||e.nextElementSibling.textContent))return c(e.nextElementSibling.innerText||e.nextElementSibling.textContent);if(y.startsWith(z+':')||y.startsWith(z+' -'))return c(x.slice(z.length+1))}}return''},u=()=>{try{const r=new URL(location.href),p=['jobReferenceCode','id','jobId','jobID','reqId','requisitionId','wdjobreqid','referenceCode','jobReqId','job_id'];for(const k of p){const v=r.searchParams.get(k);if(v)return c(v)}for(const part of r.pathname.split('/').filter(Boolean).reverse()){const v=decodeURIComponent(part),q=v.match(/_([A-Za-z0-9-]{4,})$/)||v.match(/\b([A-Z]{1,5}[-_]\d{3,})\b/i)||v.match(/\b(\d{5,})\b/)||v.match(/^((?=.*\d)[A-Za-z0-9-]{6,})$/);if(q)return c(q[1]||q[0])}}catch(e){}return''},skills=()=>['JavaScript','TypeScript','Java','Python','SQL','Selenium','Playwright','Cypress','Postman','API Testing','Manual Testing','Automation Testing','Regression Testing','Functional Testing','Jira','Agile','Scrum','React','Node.js','AWS','Azure'].filter(x=>new RegExp('(^|[^a-z0-9+#.])'+x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9+#.]|$)','i').test(t)).join(', '),exp=()=>{const r=t.match(/(\d+\s*-\s*\d+\s*years|\d+\+?\s*years|fresher|entry level)/i);return r?c(r[0]):''},wm=()=>/\bremote\b/i.test(t)?'Remote':/\bhybrid\b/i.test(t)?'Hybrid':/\bonsite\b|\bon-site\b|\bon site\b/i.test(t)?'On site':'',q=new URLSearchParams({Job_link:location.href,Company:s(['[data-testid*="company" i]','[data-test*="company" i]','[aria-label*="company" i]','[class*="company" i]'])||l(['Company','Employer','Organization'])||m(['job:company','company','employer','og:site_name']),Role:s(['h1','[data-testid*="job-title" i]','[data-testid*="title" i]','[aria-label*="job title" i]','[class*="job-title" i]'])||l(['Job title','Title','Role','Position'])||m(['job:title','og:title','twitter:title'])||document.title,Location:s(['[data-testid*="location" i]','[data-test*="location" i]','[aria-label*="location" i]','[class*="location" i]'])||l(['Location','Job location','Work location','Office'])||m(['job:location','location']),Job_id:l(['Job ID','Job Id','Job number','Job reference','Requisition ID','Req ID','Reference number'])||m(['job:id','job:identifier','job:requisition','requisitionId','reqId'])||u(),Exp_required:l(['Experience','Experience Required'])||exp(),Skills:l(['Skills','Required skills','Key skills','Technologies'])||m(['job:skills','skills','keywords'])||skills(),Work_mode:wm()});location.href='https://theblinder.github.io/job-tracker-automation/?'+q.toString()})()
```

The tracker will receive the extracted values and let you review the fields before saving. Some mobile browsers and job sites may restrict bookmarklet execution; improving mobile reliability remains part of the project scope.

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
- Bookmarklet extraction depends on the details already being visible in the current job page.
- Mobile bookmarklet support is a project goal, but browser/site restrictions may require follow-up work or a browser extension approach.
- Pasted-link extraction requires the optional local Playwright server to be running.
- The Playwright flow still needs manual review and correction.
- The hosted form depends on the deployed Apps Script endpoint being available.
- Browser-side Job ID detection is best-effort and may not work for every posting.
- Access-key validation and Google Sheets duplicate prevention are enforced in Apps Script, so the backend must stay in sync with the form fields.
- Automated tests are not currently included.
- The repository includes local Excel storage, but Google Sheets is the primary hosted-form storage path.

## License

ISC

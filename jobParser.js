const PAGE_SPECIFIC_SELECTORS = {
  greenhouse: {
    role: [".app-title", "h1", "[data-mapped='true'] h1"],
    location: [".location", "[data-qa='job-location']"]
  },
  lever: {
    role: [".posting-headline h2", ".posting-headline h1"],
    location: [".posting-categories .location", ".posting-headline .sort-by-location"]
  },
  workday: {
    role: [
      "[data-automation-id='jobPostingHeader'] h1",
      "[data-automation-id='jobPostingHeader']",
      "[data-automation-id='jobTitle']"
    ],
    location: [
      "[data-automation-id='locations']",
      "[data-automation-id='job-location']",
      "[data-automation-id='location']"
    ]
  },
  smartrecruiters: {
    role: [".job-title", "[data-test='job-title']", "h1"],
    location: [".job-detail.location", "[data-test='location']"]
  },
  ashby: {
    role: ["h1", "[data-testid='job-title']"],
    location: ["[data-testid='job-location']", "[aria-label*='location' i]"]
  },
  workable: {
    role: ["h1", "[data-ui='job-title']"],
    location: ["[data-ui='job-location']", ".job-location"]
  },
  icims: {
    role: [".iCIMS_JobHeader h1", "h1"],
    location: [".iCIMS_JobHeader .iCIMS_JobHeaderField", "[data-testid='job-location']"]
  }
};

const COMMON_ROLE_SELECTORS = [
  "h1",
  "[data-testid*='job-title' i]",
  "[data-testid*='title' i]",
  "[data-test*='job-title' i]",
  "[data-qa*='job-title' i]",
  "[aria-label*='job title' i]",
  "[aria-label*='role' i]",
  ".job-title",
  ".jobTitle",
  ".posting-title"
];

const COMMON_LOCATION_SELECTORS = [
  "[data-testid*='job-location' i]",
  "[data-testid*='location' i]",
  "[data-test*='location' i]",
  "[data-qa*='location' i]",
  "[aria-label*='location' i]",
  ".job-location",
  ".location",
  ".locations"
];

function cleanExtractedValue(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(job title|title|role|position|location|locations)\s*[:\-]\s*/i, "")
    .trim();
}

function getPageSpecificSelectors(jobUrl, fieldName) {
  try {
    const hostname = new URL(jobUrl).hostname.toLowerCase();
    const key = Object.keys(PAGE_SPECIFIC_SELECTORS).find(name => hostname.includes(name));

    return key ? PAGE_SPECIFIC_SELECTORS[key][fieldName] || [] : [];
  } catch {
    return [];
  }
}

function isNoiseLine(line) {
  const text = cleanExtractedValue(line).toLowerCase();

  const noiseWords = [
    "skip to",
    "privacy",
    "terms",
    "cookie",
    "sign in",
    "login",
    "apply",
    "footer",
    "navigation",
    "menu",
    "accessibility",
    "save job",
    "share"
  ];

  return noiseWords.some(word => text.includes(word));
}

function isConfidentRole(value) {
  const text = cleanExtractedValue(value);
  const lower = text.toLowerCase();

  if (text.length < 3 || text.length > 120) return false;
  if (isNoiseLine(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (lower.includes("search results") || lower.includes("jobs found")) return false;
  if (lower.includes("job description") || lower.includes("responsibilities")) return false;
  if (text.split(" ").length > 14) return false;

  return /[a-z]/i.test(text);
}

function isConfidentLocation(value) {
  const text = cleanExtractedValue(value);
  const lower = text.toLowerCase();

  if (text.length < 2 || text.length > 100) return false;
  if (isNoiseLine(text)) return false;
  if (lower.includes("job description") || lower.includes("responsibilities")) return false;
  if (text.split(" ").length > 12) return false;

  return /[a-z]/i.test(text);
}

async function getFirstVisibleSelectorText(page, selectors, isConfidentValue) {
  for (const selector of selectors) {
    try {
      const locator = page.locator(selector).filter({ hasText: /\S/ }).first();
      const count = await locator.count();

      if (!count) continue;

      const text = cleanExtractedValue(await locator.innerText({ timeout: 1000 }));

      if (isConfidentValue(text)) {
        return { value: text, source: `selector: ${selector}` };
      }
    } catch {
      // Keep trying lower-priority selectors.
    }
  }

  return { value: "", source: "" };
}

async function getTextNearLabels(page, labels, isConfidentValue) {
  try {
    const candidates = await page.evaluate(labelList => {
      const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
      const labelsLower = labelList.map(label => label.toLowerCase());
      const elements = Array.from(document.body.querySelectorAll("body *"));
      const values = [];

      for (const element of elements) {
        const text = normalize(element.innerText || element.textContent);
        if (!text || text.length > 180) continue;

        const lower = text.toLowerCase();

        for (const label of labelsLower) {
          if (lower === label && element.nextElementSibling) {
            values.push(normalize(element.nextElementSibling.innerText || element.nextElementSibling.textContent));
          }

          if (lower.startsWith(`${label}:`) || lower.startsWith(`${label} -`)) {
            values.push(text.replace(new RegExp(`^${label}\\s*[:-]\\s*`, "i"), ""));
          }
        }
      }

      return values;
    }, labels);

    for (const candidate of candidates) {
      const value = cleanExtractedValue(candidate);

      if (isConfidentValue(value)) {
        return { value, source: `visible text near label: ${labels.join("/")}` };
      }
    }
  } catch {
    // Fall through to lower-priority extraction.
  }

  return { value: "", source: "" };
}

function logExtraction(fieldName, result) {
  if (result.value) {
    console.log(`[extract] ${fieldName}: ${result.source} -> ${result.value}`);
  } else {
    console.log(`[extract] ${fieldName}: no confident value found`);
  }
}

function detectJobIdFromUrl(jobUrl) {
  try {
    const url = new URL(jobUrl);

    const possibleParams = [
      "jobReferenceCode",
      "id",
      "jobId",
      "jobID",
      "reqId",
      "requisitionId",
      "wdjobreqid",
      "referenceCode",
      "jobReqId",
      "job_req_id",
      "requisition_id",
      "req_id",
      "jobid",
      "job-id",
      "job_id",
      "requisition code",
      "requisition-code"
    ];

    for (const param of possibleParams) {
      const value = url.searchParams.get(param);
      if (value) return value;
    }

    const pathParts = url.pathname.split("/").filter(Boolean);

    for (const part of pathParts.reverse()) {
      const underscoreId = part.match(/_([A-Za-z0-9-]{4,})$/);
      if (underscoreId) return underscoreId[1];

      const numberId = part.match(/\b\d{5,}\b/);
      if (numberId) return numberId[0];

      const alphaNumericId = part.match(/^(?=.*\d)[A-Za-z0-9-]{6,}$/);
      if (alphaNumericId) return alphaNumericId[0];

      if (/^[a-f0-9-]{20,}$/i.test(part)) return part;
    }

    return "";
  } catch {
    return "";
  }
}

function detectPageType(jobUrl, bodyText) {
  const url = new URL(jobUrl);
  const text = bodyText.toLowerCase();

  const listingUrlSignals =
    url.searchParams.has("query") ||
    url.searchParams.has("start");

  const detailPageSignals =
    text.includes("job description") ||
    text.includes("responsibilities") ||
    text.includes("qualifications") ||
    text.includes("apply now") ||
    text.includes("job id") ||
    text.includes("requisition id");

  if (detailPageSignals) {
    return "detail";
  }

  if (
    listingUrlSignals ||
    text.includes("search results") ||
    text.includes("jobs found")
  ) {
    return "listing";
  }

  return "detail";
}

function detectRoleFromPage(pageTitle, bodyText)
 {
  const lines = bodyText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const ignoredLines = [
  "apply",
  "sign in",
  "privacy",
  "terms",
  "cookie",
  "job description",
  "grade",
  "skip to",
  "footer",
  "navigation",
  "menu",
  "accessibility"
];

  const possibleRole = lines.find(line =>
    line.length > 5 &&
    line.length < 100 &&
    !ignoredLines.some(word => line.toLowerCase().includes(word))&&
    !line.toLowerCase().includes("skip to content")&&
    !ignoredLines.some(word => line.toLowerCase().includes(word))
  );

  const role = possibleRole || pageTitle || "";
  return isConfidentRole(role) ? cleanExtractedValue(role) : "";
}

function detectWorkMode(bodyText)
 {
  const text = bodyText.toLowerCase();

  if (text.includes("remote")) {
    return "Remote";
  }

  if (text.includes("hybrid")) {
    return "Hybrid";
  }

  if (text.includes("onsite")) {
    return "On site";
  }

  return "";
}

function detectRoleFromUrl(jobUrl) {
  const url = new URL(jobUrl);

  const roleParams = ["jobtitle", "jobTitle", "title", "role"];

  for (const param of roleParams) {
    const value = url.searchParams.get(param);
    if (value) {
      const role = cleanExtractedValue(value.replace(/-/g, " "));
      return isConfidentRole(role) ? role : "";
    }
  }

  return "";
}

function detectLocation(bodyText) 
{
  const lines = bodyText.split("\n");

  const commonLocations = [
    "Bangalore",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Mumbai",
    "Delhi",
    "Noida",
    "Gurgaon",
    "Kolkata",
    "Remote",
    "India",
    "United States",
    "Singapore",
    "Poland",
    "Germany",
    "Hybrid"
  ];

  for (const line of lines) {
    for (const location of commonLocations) {
      if (line.toLowerCase().includes(location.toLowerCase())) {
        return cleanExtractedValue(location);
      }
    }
  }

  return "";
}

async function extractRole(page, jobUrl, pageTitle, bodyText) {
  const pageSpecific = await getFirstVisibleSelectorText(
    page,
    getPageSpecificSelectors(jobUrl, "role"),
    isConfidentRole
  );
  if (pageSpecific.value) {
    logExtraction("Role", pageSpecific);
    return pageSpecific.value;
  }

  const commonSelector = await getFirstVisibleSelectorText(page, COMMON_ROLE_SELECTORS, isConfidentRole);
  if (commonSelector.value) {
    logExtraction("Role", commonSelector);
    return commonSelector.value;
  }

  const nearLabel = await getTextNearLabels(page, ["Job title", "Title", "Role", "Position"], isConfidentRole);
  if (nearLabel.value) {
    logExtraction("Role", nearLabel);
    return nearLabel.value;
  }

  const urlRole = detectRoleFromUrl(jobUrl);
  if (urlRole) {
    const result = { value: urlRole, source: "fallback: URL parameter" };
    logExtraction("Role", result);
    return result.value;
  }

  const pageRole = detectRoleFromPage(pageTitle, bodyText);
  const result = pageRole
    ? { value: pageRole, source: "fallback: page text/title" }
    : { value: "", source: "" };
  logExtraction("Role", result);
  return result.value;
}

async function extractLocation(page, jobUrl, bodyText) {
  const pageSpecific = await getFirstVisibleSelectorText(
    page,
    getPageSpecificSelectors(jobUrl, "location"),
    isConfidentLocation
  );
  if (pageSpecific.value) {
    logExtraction("Location", pageSpecific);
    return pageSpecific.value;
  }

  const commonSelector = await getFirstVisibleSelectorText(page, COMMON_LOCATION_SELECTORS, isConfidentLocation);
  if (commonSelector.value) {
    logExtraction("Location", commonSelector);
    return commonSelector.value;
  }

  const nearLabel = await getTextNearLabels(page, ["Location", "Locations"], isConfidentLocation);
  if (nearLabel.value) {
    logExtraction("Location", nearLabel);
    return nearLabel.value;
  }

  const bodyLocation = detectLocation(bodyText);
  const result = bodyLocation
    ? { value: bodyLocation, source: "fallback: known location in page text" }
    : { value: "", source: "" };
  logExtraction("Location", result);
  return result.value;
}

function detectCompanyFromUrl(jobUrl) 
{
  try {
    const parsedUrl = new URL(jobUrl);
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

    const ignoredWords = new Set([
      "www",
      "com",
      "org",
      "net",
      "io",
      "co",
      "in",
      "us",
      "uk",
      "ca",
      "au",
      "de",
      "fr",
      "eu",
      "careers",
      "career",
      "jobs",
      "job",
      "apply",
      "application",
      "applicant",
      "candidate",
      "candidates",
      "hiring",
      "hire",
      "recruiting",
      "recruitment",
      "recruit",
      "talent",
      "join",
      "work",
      "employment",
      "opportunities",
      "opening",
      "openings",
      "positions",
      "position",
      "details",
      "description",
      "search",
      "listing",
      "listings",
      "portal",
      "ats",
      "hr",
      "people",
      "workday",
      "myworkdayjobs",
      "greenhouse",
      "lever",
      "ashbyhq",
      "workable",
      "smartrecruiters",
      "icims",
      "successfactors",
      "oraclecloud",
      "taleo",
      "bamboohr",
      "jobvite",
      "eightfold",
      "teamtailor",
      "recruitee",
      "boards",
      "board",
      "wd1",
      "wd3",
      "wd5",
      "myjobs",
      "india",
      "india-en",
      "en",
      "en-us",
      "en-gb",
      "usijobs"
    ]);

    function getCleanParts(value) {
      return value
        .toLowerCase()
        .split(/[./_-]+/)
        .map(part => part.trim())
        .filter(Boolean)
        .filter(part => !ignoredWords.has(part))
        .filter(part => !/^\d+$/.test(part))
        .filter(part => part.length > 1);
    }

    const hostnameParts = getCleanParts(hostname);
    const hostnameCompany = hostnameParts[0];

    if (hostnameCompany) {
      return hostnameCompany;
    }

    const pathParts = getCleanParts(parsedUrl.pathname);
    const pathCompany = pathParts[0];

    return pathCompany || "";
  } catch {
    return "";
  }
}

function detectCompanyFromPage(bodyText, fallbackCompany) {
  const lines = bodyText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const possibleCompany = lines.find(line =>
    line.length > 2 &&
    line.length < 80 &&
    !isNoiseLine(line)
  );

  return possibleCompany || fallbackCompany || "";
}

function detectExperience(bodyText) {
  const experiencePattern = /(\d+\s*[-–]\s*\d+\s*years|\d+\+?\s*years|fresher|entry level)/i;
  const match = bodyText.match(experiencePattern);

  return match ? match[0].trim() : "";
}

function detectPostedDate(bodyText) 
{
  const postedPatterns = [
    /posted\s*(on)?\s*[:\-]?\s*([a-zA-Z0-9,\s]+ago)/i,
    /posted\s*(on)?\s*[:\-]?\s*([a-zA-Z]+\s+\d{1,2},?\s+\d{4})/i,
    /date\s*posted\s*[:\-]?\s*([a-zA-Z0-9,\s]+)/i
  ];

  for (const pattern of postedPatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      return (match[2] || match[1]).trim();
    }
  }

  return "";
}


module.exports = {
  detectJobIdFromUrl,
  detectWorkMode,
  detectCompanyFromUrl,
  detectCompanyFromPage,
  detectLocation,
  extractLocation,
  detectPageType,
  detectRoleFromPage,
  detectRoleFromUrl,
  extractRole,
  detectExperience,
  detectPostedDate
};

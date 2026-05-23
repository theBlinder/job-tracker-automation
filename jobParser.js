const { chromium } = require("playwright");

const GENERIC_SELECTORS = {
  company: [
    "[data-testid*='company' i]",
    "[data-test*='company' i]",
    "[data-qa*='company' i]",
    "[aria-label*='company' i]",
    "[class*='company' i]",
    "[id*='company' i]",
    "[class*='employer' i]"
  ],
  role: [
    "h1",
    "[data-testid*='job-title' i]",
    "[data-testid*='title' i]",
    "[data-test*='job-title' i]",
    "[data-qa*='job-title' i]",
    "[aria-label*='job title' i]",
    "[aria-label*='role' i]",
    "[class*='job-title' i]",
    "[class*='jobTitle' i]",
    "[class*='posting-title' i]",
    "[class*='position-title' i]"
  ],
  location: [
    "[data-testid*='job-location' i]",
    "[data-testid*='location' i]",
    "[data-test*='location' i]",
    "[data-qa*='location' i]",
    "[aria-label*='location' i]",
    "[class*='job-location' i]",
    "[class*='location' i]",
    "[id*='location' i]"
  ],
  jobId: [
    "[data-testid*='job-id' i]",
    "[data-testid*='jobid' i]",
    "[data-testid*='requisition' i]",
    "[data-test*='job-id' i]",
    "[data-qa*='job-id' i]",
    "[aria-label*='job id' i]",
    "[aria-label*='requisition' i]",
    "[class*='job-id' i]",
    "[class*='requisition' i]",
    "[id*='job-id' i]"
  ],
  skills: [
    "[data-testid*='skill' i]",
    "[data-test*='skill' i]",
    "[data-qa*='skill' i]",
    "[aria-label*='skill' i]",
    "[class*='skill' i]",
    "[id*='skill' i]",
    "[class*='qualification' i]",
    "[id*='qualification' i]"
  ]
};

const FIELD_LABELS = {
  company: ["Company", "Employer", "Organization", "Hiring company"],
  role: ["Job title", "Title", "Role", "Position", "Opening"],
  location: ["Location", "Locations", "Job location", "Work location", "Office"],
  jobId: [
    "Job ID",
    "Job Id",
    "Job number",
    "Job reference",
    "Requisition ID",
    "Req ID",
    "Reference number"
  ],
  skills: ["Skills", "Required skills", "Key skills", "Technologies", "Qualifications"]
};

const META_NAMES = {
  company: [
    "job:company",
    "company",
    "employer",
    "hiringOrganization",
    "og:site_name",
    "application-name"
  ],
  role: [
    "job:title",
    "title",
    "og:title",
    "twitter:title"
  ],
  location: [
    "job:location",
    "location",
    "job:jobLocation",
    "og:locality",
    "place:location:latitude"
  ],
  jobId: [
    "job:id",
    "job:identifier",
    "job:requisition",
    "requisitionId",
    "reqId"
  ],
  skills: [
    "job:skills",
    "skills",
    "keywords",
    "news_keywords"
  ],
  description: [
    "description",
    "og:description",
    "twitter:description"
  ]
};

const ROLE_URL_PARAMS = ["jobtitle", "jobTitle", "title", "role", "position"];
const LOCATION_URL_PARAMS = ["location", "jobLocation", "city", "country"];
const COMPANY_URL_PARAMS = ["company", "employer", "organization"];
const JOB_ID_URL_PARAMS = [
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
  "job_id"
];

const KNOWN_SKILLS = [
  "Accessibility",
  "Agile",
  "API Testing",
  "Automation Testing",
  "AWS",
  "Azure",
  "C#",
  "C++",
  "CI/CD",
  "Cypress",
  "Docker",
  "ETL",
  "Functional Testing",
  "Git",
  "GraphQL",
  "Java",
  "JavaScript",
  "Jenkins",
  "Jira",
  "Kubernetes",
  "Manual Testing",
  "Node.js",
  "Performance Testing",
  "Playwright",
  "Postman",
  "Python",
  "React",
  "Regression Testing",
  "REST",
  "Scrum",
  "Security Testing",
  "Selenium",
  "SQL",
  "TestNG",
  "TypeScript",
  "UAT"
];

function cleanExtractedValue(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t\r\n]+/g, " ")
    .replace(/^(company|employer|organization|job title|title|role|position|opening|location|locations|job location|work location|office|job id|job number|job reference|requisition id|req id|reference number|skills|required skills|key skills|technologies|qualifications)\s*[:\-]\s*/i, "")
    .trim();
}

function cleanUrlText(value) {
  try {
    return cleanExtractedValue(decodeURIComponent(String(value || "").replace(/[+_-]+/g, " ")));
  } catch {
    return cleanExtractedValue(String(value || "").replace(/[+_-]+/g, " "));
  }
}

function cleanJobIdValue(value) {
  try {
    return cleanExtractedValue(decodeURIComponent(String(value || "").replace(/\+/g, " ")));
  } catch {
    return cleanExtractedValue(String(value || "").replace(/\+/g, " "));
  }
}

function dedupeValues(values) {
  const seen = new Set();
  const result = [];

  for (const value of values.map(cleanExtractedValue).filter(Boolean)) {
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }

  return result;
}

function isNoiseLine(value) {
  const text = cleanExtractedValue(value).toLowerCase();
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
    "share",
    "declined",
    "applied",
    "application submitted",
    "application status",
    "not selected",
    "rejected",
    "search results",
    "jobs found"
  ];

  return noiseWords.some(word => text.includes(word));
}

function hasLetters(value) {
  return /[a-z]/i.test(value);
}

function isConfidentCompany(value) {
  const text = cleanExtractedValue(value);
  const lower = text.toLowerCase();

  if (text.length < 2 || text.length > 90) return false;
  if (!hasLetters(text) || isNoiseLine(text)) return false;
  if (/(workday|myworkdayjobs|greenhouse|lever|ashby|workable|smartrecruiters|icims|successfactors|oraclecloud|taleo|jobvite|careers|jobs)$/i.test(lower)) return false;
  if (lower.includes("job description") || lower.includes("responsibilities")) return false;

  return true;
}

function isConfidentRole(value) {
  const text = cleanExtractedValue(value);
  const lower = text.toLowerCase();

  if (text.length < 3 || text.length > 120) return false;
  if (!hasLetters(text) || isNoiseLine(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (lower.includes("job description") || lower.includes("responsibilities")) return false;
  if (text.split(" ").length > 14) return false;

  return true;
}

function isConfidentLocation(value) {
  const text = cleanExtractedValue(value);
  const lower = text.toLowerCase();

  if (text.length < 2 || text.length > 120) return false;
  if (!hasLetters(text) || isNoiseLine(text)) return false;
  if (lower.includes("job description") || lower.includes("responsibilities")) return false;
  if (text.split(" ").length > 14) return false;

  return true;
}

function isConfidentJobId(value) {
  const text = cleanExtractedValue(value);

  if (text.length < 3 || text.length > 80) return false;
  if (isNoiseLine(text)) return false;
  if (!/[a-z0-9]/i.test(text)) return false;
  if (text.split(" ").length > 6) return false;

  return /(?:\d{3,}|[a-z]{1,}[-_][a-z0-9]{2,}|[a-z0-9]{6,})/i.test(text);
}

function isConfidentSkills(value) {
  const text = cleanExtractedValue(value);

  if (text.length < 2 || text.length > 600) return false;
  if (isNoiseLine(text)) return false;

  return hasLetters(text);
}

function logExtraction(fieldName, result) {
  if (result.value) {
    console.log(`[extract] ${fieldName}: ${result.source} -> ${result.value}`);
  } else {
    console.log(`[extract] ${fieldName}: no confident value found`);
  }
}

async function getFirstVisibleSelectorText(page, selectors, isConfidentValue) {
  for (const selector of selectors) {
    try {
      const values = await page.evaluate(cssSelector => {
        const elements = Array.from(document.querySelectorAll(cssSelector)).slice(0, 10);

        return elements
          .filter(element => {
            const style = window.getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.visibility !== "hidden" &&
              style.display !== "none" &&
              rect.width > 0 &&
              rect.height > 0;
          })
          .map(element => element.innerText || element.textContent || "");
      }, selector);

      for (const candidate of values) {
        const text = cleanExtractedValue(candidate);
        if (isConfidentValue(text)) {
          return { value: text, source: `selector: ${selector}` };
        }
      }
    } catch {
      // Some pages expose unusual markup; keep walking the priority list.
    }
  }

  return { value: "", source: "" };
}

async function getMetaContent(page, names, isConfidentValue) {
  for (const name of names) {
    const value = cleanExtractedValue(await page.evaluate(metaName => {
      const element = document.querySelector(`meta[name="${metaName}"], meta[property="${metaName}"]`);
      return element ? element.getAttribute("content") : "";
    }, name).catch(() => ""));

    if (isConfidentValue(value)) {
      return { value, source: `meta: ${name}` };
    }
  }

  return { value: "", source: "" };
}

async function getVisibleTextNearLabels(page, labels, isConfidentValue) {
  try {
    const candidates = await page.evaluate(labelList => {
      const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
      const normalizedLabels = labelList.map(label => label.toLowerCase());
      const elements = Array.from(document.body.querySelectorAll("body *"));
      const values = [];

      function add(value) {
        const normalized = normalize(value);
        if (normalized) values.push(normalized);
      }

      for (const element of elements) {
        const text = normalize(element.innerText || element.textContent);
        if (!text || text.length > 220) continue;

        const lower = text.toLowerCase();

        for (const label of normalizedLabels) {
          if (lower === label) {
            add(element.nextElementSibling && (element.nextElementSibling.innerText || element.nextElementSibling.textContent));
            add(element.parentElement && element.parentElement.innerText && element.parentElement.innerText.replace(text, ""));
          }

          if (lower.startsWith(`${label}:`) || lower.startsWith(`${label} -`)) {
            add(text.slice(label.length + 1));
          }
        }
      }

      return values;
    }, labels);

    for (const candidate of candidates) {
      const value = cleanExtractedValue(candidate);
      if (isConfidentValue(value)) {
        return { value, source: `visible label: ${labels.join("/")}` };
      }
    }
  } catch {
    // Label extraction is best-effort.
  }

  return { value: "", source: "" };
}

function getUrlParam(jobUrl, params, isConfidentValue) {
  try {
    const url = new URL(jobUrl);

    for (const param of params) {
      const value = cleanUrlText(url.searchParams.get(param));
      if (isConfidentValue(value)) {
        return { value, source: `url param: ${param}` };
      }
    }
  } catch {
    // Ignore invalid URLs and fall back to blanks.
  }

  return { value: "", source: "" };
}

function getPageTitleCandidate(pageTitle, isConfidentValue) {
  const parts = cleanExtractedValue(pageTitle)
    .split(/\s(?:\||-|at|@)\s|,/)
    .map(cleanExtractedValue)
    .filter(Boolean);

  for (const part of parts) {
    if (isConfidentValue(part)) {
      return { value: part, source: "page title" };
    }
  }

  return { value: "", source: "" };
}

function detectJobIdFromUrl(jobUrl) {
  try {
    const url = new URL(jobUrl);

    for (const param of JOB_ID_URL_PARAMS) {
      const value = cleanJobIdValue(url.searchParams.get(param));
      if (isConfidentJobId(value)) return value;
    }

    const pathParts = url.pathname.split("/").filter(Boolean).reverse();

    for (const rawPart of pathParts) {
      const part = cleanJobIdValue(rawPart);
      const patterns = [
        /_([A-Za-z0-9-]{4,})$/,
        /\b([A-Z]{1,5}[-_]\d{3,})\b/i,
        /\b(\d{5,})\b/,
        /^((?=.*\d)[A-Za-z0-9-]{6,})$/,
        /^([a-f0-9-]{20,})$/i
      ];

      for (const pattern of patterns) {
        const match = part.match(pattern);
        const value = cleanExtractedValue(match && (match[1] || match[0]));
        if (isConfidentJobId(value)) return value;
      }
    }
  } catch {
    return "";
  }

  return "";
}

function detectPageType(jobUrl, bodyText) {
  const text = String(bodyText || "").toLowerCase();
  let listingUrlSignals = false;

  try {
    const url = new URL(jobUrl);
    listingUrlSignals =
      url.searchParams.has("query") ||
      url.searchParams.has("q") ||
      url.searchParams.has("search") ||
      url.searchParams.has("start");
  } catch {
    listingUrlSignals = false;
  }

  const detailPageSignals =
    text.includes("job description") ||
    text.includes("responsibilities") ||
    text.includes("qualifications") ||
    text.includes("apply now") ||
    text.includes("job id") ||
    text.includes("requisition id");

  if (detailPageSignals) return "detail";

  if (
    listingUrlSignals ||
    text.includes("search results") ||
    text.includes("jobs found")
  ) {
    return "listing";
  }

  return "detail";
}

function detectWorkMode(bodyText) {
  const text = String(bodyText || "").toLowerCase();

  if (/\bremote\b/.test(text)) return "Remote";
  if (/\bhybrid\b/.test(text)) return "Hybrid";
  if (/\bonsite\b|\bon-site\b|\bon site\b/.test(text)) return "On site";

  return "";
}

function detectRoleFromUrl(jobUrl) {
  return getUrlParam(jobUrl, ROLE_URL_PARAMS, isConfidentRole).value;
}

function detectLocation(bodyText) {
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

  const text = String(bodyText || "").toLowerCase();
  const location = commonLocations.find(item => text.includes(item.toLowerCase()));

  return location ? cleanExtractedValue(location) : "";
}

function detectCompanyFromUrl(jobUrl) {
  try {
    const parsedUrl = new URL(jobUrl);
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
      "candidate",
      "hiring",
      "recruiting",
      "talent",
      "work",
      "employment",
      "opportunities",
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
      "en",
      "en-us",
      "en-gb"
    ]);

    const candidates = [
      ...parsedUrl.hostname.toLowerCase().replace(/^www\./, "").split(/[./_-]+/),
      ...parsedUrl.pathname.toLowerCase().split(/[./_-]+/)
    ]
      .map(cleanUrlText)
      .filter(Boolean)
      .filter(part => !ignoredWords.has(part.toLowerCase()))
      .filter(part => !/^\d+$/.test(part))
      .filter(part => part.length > 1);

    const company = candidates.find(isConfidentCompany);
    return company || "";
  } catch {
    return "";
  }
}

function detectCompanyFromPage(bodyText, fallbackCompany) {
  const lines = String(bodyText || "")
    .split("\n")
    .map(cleanExtractedValue)
    .filter(Boolean);

  const possibleCompany = lines.find(line => isConfidentCompany(line) && !isConfidentRole(line));
  return possibleCompany || cleanExtractedValue(fallbackCompany);
}

function detectRoleFromPage(pageTitle, bodyText) {
  const fromTitle = getPageTitleCandidate(pageTitle, isConfidentRole).value;
  if (fromTitle) return fromTitle;

  const lines = String(bodyText || "")
    .split("\n")
    .map(cleanExtractedValue)
    .filter(Boolean);

  return lines.find(isConfidentRole) || "";
}

function detectExperience(bodyText) {
  const experiencePattern = /(\d+\s*-\s*\d+\s*years|\d+\+?\s*years|fresher|entry level)/i;
  const match = String(bodyText || "").match(experiencePattern);

  return match ? cleanExtractedValue(match[0]) : "";
}

function detectPostedDate(bodyText) {
  const postedPatterns = [
    /posted\s*(?:on)?\s*[:\-]?\s*([a-zA-Z0-9,\s]+ago)/i,
    /posted\s*(?:on)?\s*[:\-]?\s*([a-zA-Z]+\s+\d{1,2},?\s+\d{4})/i,
    /date\s*posted\s*[:\-]?\s*([a-zA-Z0-9,\s]+)/i
  ];

  for (const pattern of postedPatterns) {
    const match = String(bodyText || "").match(pattern);
    if (match) return cleanExtractedValue(match[1]);
  }

  return "";
}

function detectSkills(bodyText) {
  const lower = String(bodyText || "").toLowerCase();
  const skills = KNOWN_SKILLS.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9+#.])${escaped.toLowerCase()}([^a-z0-9+#.]|$)`).test(lower);
  });

  return dedupeValues(skills).join(", ");
}

function parseSkillsFromText(value) {
  const cleaned = cleanExtractedValue(value);
  const knownSkills = detectSkills(cleaned);

  if (knownSkills) return knownSkills;

  const parts = cleaned
    .split(/,|;|\||\u2022| and /i)
    .map(cleanExtractedValue)
    .filter(part => part.length >= 2 && part.length <= 40)
    .filter(part => !isNoiseLine(part));

  return dedupeValues(parts).slice(0, 20).join(", ");
}

async function extractRole(page, jobUrl, pageTitle, bodyText) {
  const attempts = [
    () => getFirstVisibleSelectorText(page, GENERIC_SELECTORS.role, isConfidentRole),
    () => getMetaContent(page, META_NAMES.role, isConfidentRole),
    () => getVisibleTextNearLabels(page, FIELD_LABELS.role, isConfidentRole),
    async () => getUrlParam(jobUrl, ROLE_URL_PARAMS, isConfidentRole),
    async () => getPageTitleCandidate(pageTitle, isConfidentRole),
    async () => {
      const value = detectRoleFromPage(pageTitle, bodyText);
      return value ? { value, source: "fallback: visible page text" } : { value: "", source: "" };
    }
  ];

  for (const attempt of attempts) {
    const result = await attempt();
    if (result.value) {
      logExtraction("Role", result);
      return result.value;
    }
  }

  logExtraction("Role", { value: "", source: "" });
  return "";
}

async function extractLocation(page, jobUrl, bodyText) {
  const attempts = [
    () => getFirstVisibleSelectorText(page, GENERIC_SELECTORS.location, isConfidentLocation),
    () => getMetaContent(page, META_NAMES.location, isConfidentLocation),
    () => getVisibleTextNearLabels(page, FIELD_LABELS.location, isConfidentLocation),
    async () => getUrlParam(jobUrl, LOCATION_URL_PARAMS, isConfidentLocation),
    async () => {
      const value = detectLocation(bodyText);
      return value ? { value, source: "fallback: known location in page text" } : { value: "", source: "" };
    }
  ];

  for (const attempt of attempts) {
    const result = await attempt();
    if (result.value) {
      logExtraction("Location", result);
      return result.value;
    }
  }

  logExtraction("Location", { value: "", source: "" });
  return "";
}

async function extractCompany(page, jobUrl, pageTitle, bodyText) {
  const attempts = [
    () => getFirstVisibleSelectorText(page, GENERIC_SELECTORS.company, isConfidentCompany),
    () => getMetaContent(page, META_NAMES.company, isConfidentCompany),
    () => getVisibleTextNearLabels(page, FIELD_LABELS.company, isConfidentCompany),
    async () => getUrlParam(jobUrl, COMPANY_URL_PARAMS, isConfidentCompany),
    async () => {
      const candidates = cleanExtractedValue(pageTitle)
        .split(/\s(?:\||-|at|@)\s|,/)
        .map(cleanExtractedValue);
      const value = candidates.find(isConfidentCompany);
      return value ? { value, source: "page title" } : { value: "", source: "" };
    },
    async () => {
      const value = detectCompanyFromPage(bodyText, "");
      return value ? { value, source: "fallback: visible page text" } : { value: "", source: "" };
    },
    async () => {
      const value = detectCompanyFromUrl(jobUrl);
      return value ? { value, source: "fallback: URL hostname/path" } : { value: "", source: "" };
    }
  ];

  for (const attempt of attempts) {
    const result = await attempt();
    if (result.value) {
      logExtraction("Company", result);
      return result.value;
    }
  }

  logExtraction("Company", { value: "", source: "" });
  return "";
}

async function extractJobId(page, jobUrl) {
  const attempts = [
    () => getFirstVisibleSelectorText(page, GENERIC_SELECTORS.jobId, isConfidentJobId),
    () => getMetaContent(page, META_NAMES.jobId, isConfidentJobId),
    () => getVisibleTextNearLabels(page, FIELD_LABELS.jobId, isConfidentJobId),
    async () => {
      const value = detectJobIdFromUrl(jobUrl);
      return value ? { value, source: "fallback: URL" } : { value: "", source: "" };
    }
  ];

  for (const attempt of attempts) {
    const result = await attempt();
    if (result.value) {
      logExtraction("Job_id", result);
      return result.value;
    }
  }

  logExtraction("Job_id", { value: "", source: "" });
  return "";
}

async function extractSkills(page, bodyText) {
  const attempts = [
    async () => {
      const result = await getFirstVisibleSelectorText(page, GENERIC_SELECTORS.skills, isConfidentSkills);
      const value = parseSkillsFromText(result.value);
      return value ? { value, source: result.source } : { value: "", source: "" };
    },
    async () => {
      const result = await getMetaContent(page, META_NAMES.skills, isConfidentSkills);
      const value = parseSkillsFromText(result.value);
      return value ? { value, source: result.source } : { value: "", source: "" };
    },
    async () => {
      const result = await getVisibleTextNearLabels(page, FIELD_LABELS.skills, isConfidentSkills);
      const value = parseSkillsFromText(result.value);
      return value ? { value, source: result.source } : { value: "", source: "" };
    },
    async () => {
      const value = detectSkills(bodyText);
      return value ? { value, source: "fallback: known skills in page text" } : { value: "", source: "" };
    }
  ];

  for (const attempt of attempts) {
    const result = await attempt();
    if (result.value) {
      logExtraction("Skills", result);
      return result.value;
    }
  }

  logExtraction("Skills", { value: "", source: "" });
  return "";
}

async function extractJobDetails(jobLink) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(jobLink, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    const pageTitle = await page.title();
    const bodyText = await page.locator("body").innerText().catch(() => "");
    const metaDescription = (await getMetaContent(page, META_NAMES.description, value => Boolean(value))).value;

    const company = await extractCompany(page, jobLink, pageTitle, bodyText);
    const role = await extractRole(page, jobLink, pageTitle, bodyText);
    const location = await extractLocation(page, jobLink, bodyText);
    const jobId = await extractJobId(page, jobLink);
    const skills = await extractSkills(page, bodyText);
    const experience = detectExperience(metaDescription) || detectExperience(bodyText);
    const workMode = detectWorkMode(metaDescription) || detectWorkMode(bodyText);

    return {
      company,
      role,
      location,
      experience,
      jobId,
      skills,
      workMode,
      jobLink
    };
  } finally {
    await browser.close();
  }
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
  detectPostedDate,
  detectSkills,
  extractCompany,
  extractJobId,
  extractSkills,
  extractJobDetails
};

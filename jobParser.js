function detectJobIdFromUrl(jobUrl)
 {
  const url = new URL(jobUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  for (const part of pathParts) {
    const underscoreId = part.match(/_([A-Za-z0-9-]{4,})$/);
    if (underscoreId) return underscoreId[1];

  const alphaNumericId = part.match(/^(?=.*\d)[A-Za-z0-9-]{6,}$/);
if (alphaNumericId) return alphaNumericId[0];
    if (/^[a-f0-9-]{20,}$/i.test(part)) return part;

    if (/^[a-zA-Z]+-[a-zA-Z]+-\d+$/i.test(part)) return part;
  }

  const possibleParams = [
    "jobReferenceCode",
    "id",
    "jobId",
    "jobID",
    "reqId",
    "requisitionId",
    "wdjobreqid",
    "referenceCode"
  ];

  for (const param of possibleParams) {
    const value = url.searchParams.get(param);
    if (value) return value;
  }

  return "";
}

function detectRoleFromPage(pageTitle, bodyText, jobUrl)
 {
  const url = new URL(jobUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);

  for (const part of pathParts) {
    if (part.includes("_")) {
      return part.split("_")[0].replace(/-/g, " ");
    }

    const numberSlug = part.match(/^\d{6,}-(.+)$/);
    if (numberSlug) {
      return numberSlug[1].replace(/-/g, " ");
    }
  }

  const lines = bodyText
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const possibleRole = lines.find(line =>
    line.length > 5 &&
    line.length < 100 &&
    !line.toLowerCase().includes("apply") &&
    !line.toLowerCase().includes("privacy") &&
    !line.toLowerCase().includes("terms")
  );

  return possibleRole || pageTitle || "";
}

function detectPageType(jobUrl, bodyText) {
  const url = new URL(jobUrl);
  const text = bodyText.toLowerCase();

  if (
    url.searchParams.has("query") ||
    url.searchParams.has("start") ||
    text.includes("sort by") ||
    text.includes("view job") ||
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

  return possibleRole || pageTitle || "";
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
      return value.replace(/-/g, " ");
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
        return location;
      }
    }
  }

  return "";
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

function isNoiseLine(line)
 {
  const text = line.toLowerCase();

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
    "accessibility"
  ];

  return noiseWords.some(word => text.includes(word));
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



module.exports = {
  detectJobIdFromUrl,
  detectWorkMode,
  detectCompanyFromUrl,
  detectCompanyFromPage,
  detectLocation,
  detectPageType,
  detectRoleFromPage,
  detectRoleFromUrl
};

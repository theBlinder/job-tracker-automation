function detectJobIdFromUrl(jobUrl) 
{
  const url = new URL(jobUrl);

  const possibleParams = [
    "jobReferenceCode",
    "id",
    "jobId",
    "jobID",
    "reqId",
    "requisitionId",
    "referenceCode"
  ];

  for (const param of possibleParams) {
    const value = url.searchParams.get(param);
    if (value) {
      return value;
    }
  }

  const pathParts = url.pathname.split("/").filter(Boolean);

for (const part of pathParts) {
  const leadingNumber = part.match(/^\d{6,}/);

  if (leadingNumber) {
    return leadingNumber[0];
  }

  if (/^[a-f0-9-]{20,}$/i.test(part)) {
    return part;
  }

  if (/^[a-zA-Z]+-[a-zA-Z]+-\d+$/i.test(part)) {
    return part;
  }
}
return "";
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
    return "Onsite";
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
  const hostname = new URL(jobUrl).hostname.replace("www.", "");
  const parts = hostname.split(".");

  const ignoredWords = ["careers", "jobs", "job", "apply", "usijobs", "india-en"];

  const companyPart = parts.find(part => !ignoredWords.includes(part));

  return companyPart || "";
}


module.exports = {
  detectJobIdFromUrl,
  detectWorkMode,
  detectCompanyFromUrl,
  detectLocation,
  detectPageType
};  
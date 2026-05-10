function detectJobIdFromUrl(jobUrl) {
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

const idFromPath = pathParts.find(part =>
  /^[a-zA-Z0-9-]{6,}$/.test(part) && /\d/.test(part)
);

if (idFromPath) {
  return idFromPath;
}

return "";
}

function detectWorkMode(bodyText) {
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


module.exports = {
  detectJobIdFromUrl,
  detectWorkMode
};
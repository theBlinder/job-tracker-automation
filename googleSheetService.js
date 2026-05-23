require("dotenv").config({ quiet: true });

const { google } = require("googleapis");

const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Google Sync";
const GOOGLE_SHEET_COLUMNS = [
  "Company",
  "Role",
  "Exp_required",
  "Location",
  "Skills",
  "Work_mode",
  "Job_id",
  "Job_link",
  "Applied",
  "Referral_asked",
  "Status",
  "Notes",
  "Created_at",
];

const FIELD_FALLBACKS = {
  Company: ["company"],
  Role: ["role"],
  Exp_required: ["experience"],
  Location: ["location"],
  Skills: ["skills"],
  Work_mode: ["workMode"],
  Job_id: ["jobId"],
  Job_link: ["jobLink"],
  Applied: ["applied"],
  Referral_asked: ["referralAsked"],
  Status: ["status"],
  Notes: ["notes"],
  Created_at: ["createdAt"],
};

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }

  return value;
}

function createSheetsClient() {
  const clientEmail = getRequiredEnv("GOOGLE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function getJobValue(jobData, columnName) {
  if (jobData[columnName] !== undefined) {
    return jobData[columnName];
  }

  const fallbackKey = FIELD_FALLBACKS[columnName].find(
    (key) => jobData[key] !== undefined
  );

  return fallbackKey ? jobData[fallbackKey] : "";
}

function buildGoogleSheetRow(jobData) {
  return GOOGLE_SHEET_COLUMNS.map((columnName) =>
    getJobValue(jobData, columnName)
  );
}

async function getGoogleSheetRows() {
  const sheets = createSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getRequiredEnv("GOOGLE_SHEET_ID"),
    range: `${SHEET_NAME}!A:M`,
  });

  return response.data.values || [];
}

async function isDuplicateInGoogleSheet(jobData) {
  const rows = await getGoogleSheetRows();

  const jobLink = String(getJobValue(jobData, "Job_link") || "")
    .trim()
    .toLowerCase();
  const company = String(getJobValue(jobData, "Company") || "")
    .trim()
    .toLowerCase();
  const role = String(getJobValue(jobData, "Role") || "")
    .trim()
    .toLowerCase();
  const jobId = String(getJobValue(jobData, "Job_id") || "")
    .trim()
    .toLowerCase();

  return rows.slice(1).some((row) => {
    const existingCompany = String(row[0] || "").trim().toLowerCase();
    const existingRole = String(row[1] || "").trim().toLowerCase();
    const existingJobId = String(row[6] || "").trim().toLowerCase();
    const existingJobLink = String(row[7] || "").trim().toLowerCase();

    const sameJobLink = jobLink && existingJobLink === jobLink;
    const sameCompanyRoleJobId =
      company &&
      role &&
      jobId &&
      existingCompany === company &&
      existingRole === role &&
      existingJobId === jobId;

    return sameJobLink || sameCompanyRoleJobId;
  });
}

async function saveToGoogleSheet(jobData) {
  try {
    const sheets = createSheetsClient();

    await sheets.spreadsheets.values.append({
      spreadsheetId: getRequiredEnv("GOOGLE_SHEET_ID"),
      range: `${SHEET_NAME}!A:M`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [buildGoogleSheetRow(jobData)],
      },
    });

    console.log("Google Sheet sync successful.");
  } catch (error) {
    console.log("Google Sheet sync failed.");
    console.log(error.message);
  }
}

module.exports = {
  saveToGoogleSheet,
  getGoogleSheetRows,
  isDuplicateInGoogleSheet,
  buildGoogleSheetRow,
  GOOGLE_SHEET_COLUMNS,
};

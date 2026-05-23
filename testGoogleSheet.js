const { saveToGoogleSheet } = require("./googleSheetService");

saveToGoogleSheet({
  company: "Test Company",
  role: "Test Role",
  experience: "1-2 years",
  location: "Bangalore",
  skills: "Manual Testing, API Testing",
  workMode: "Hybrid",
  jobId: "TEST123",
  jobLink: "https://example.com/test-job",
  applied: "Yes",
  referralAsked: "No",
  status: "Applied",
  notes: "Google Sheet test row",
  createdAt: new Date().toISOString(),
});
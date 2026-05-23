const express = require("express");
const path = require("path");
const { extractJobDetails } = require("./jobParser");

const app = express();
const PORT = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(express.static(__dirname));

app.post("/extract", async (req, res) => {
  try {
    const { jobLink } = req.body;

    if (!jobLink) {
      return res.status(400).json({
        success: false,
        message: "Job link is required"
      });
    }

    const extractedData = await extractJobDetails(jobLink);
    console.log("Extracted data:", extractedData);

    res.json({
      success: true,
      data: extractedData
    });
  } catch (error) {
    console.error("Extraction failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to extract job details"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Job Tracker running at http://localhost:${PORT}`);
});

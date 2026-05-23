const express = require("express");
const path = require("path");
const { extractJobDetails } = require("./jobParser");

const app = express();
const PORT = 3000;

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
    res.status(500).json({
      success: false,
      message: "Failed to extract job details"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Job Tracker running at http://localhost:${PORT}`);
});
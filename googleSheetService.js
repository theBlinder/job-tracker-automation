require("dotenv").config();
const axios = require("axios");

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

async function saveToGoogleSheet(jobData) {
  if (!GOOGLE_SCRIPT_URL) {
    console.log("Google Sheet URL is not configured. Skipping Google Sheet sync.");
    return;
  }

  try {
    const response = await axios.post(GOOGLE_SCRIPT_URL, jobData);

    console.log("Data saved to Google Sheet successfully.");
    console.log(response.data);
  } catch (error) {
    console.log("Error saving to Google Sheet.");
    console.log(error.message);
  }
}

module.exports = {
  saveToGoogleSheet
};

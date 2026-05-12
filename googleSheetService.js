const axios = require("axios");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyN3fNc7KhNX3Nw21SRhtJ_uI7ESLYXy4_UJ37c7CtJ9FYIh1qtfs0Y1L91PnPZjPEu/exec";

async function saveToGoogleSheet(jobData) {
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
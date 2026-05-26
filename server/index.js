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

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase();
}

function columnToLetter(columnNumber) {
  let letter = "";
  while (columnNumber > 0) {
    const temp = (columnNumber - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    columnNumber = (columnNumber - temp - 1) / 26;
  }
  return letter;
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

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

async function getHeaders(tabName) {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: `${tabName}!1:1`,
  });

  return response.data.values?.[0] || [];
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

  if (!sheet) throw new Error(`${tabName} tab not found`);

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

async function appendRow(tabName, row) {
  const sheets = await getSheetsClient();
  const headers = await getHeaders(tabName);

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

async function getNextPetId() {
  const headers = await getHeaders(MASTER_TAB);
  const rows = await getRows(MASTER_TAB);

  const uniqueIdIndex = headers.findIndex(
    (h) => normalizeHeader(h) === "unique id"
  );

  const count = rows.slice(1).filter((row) => row[uniqueIdIndex]).length;
  return `pet-${count + 1}`;
}

async function getNextVisitorId() {
  const headers = await getHeaders(VISITORS_TAB);
  const rows = await getRows(VISITORS_TAB);

  const visitorIdIndex = headers.findIndex(
    (h) => normalizeHeader(h) === "visitor id"
  );

  const count = rows.slice(1).filter((row) => row[visitorIdIndex]).length;
  return `visitor-${count + 1}`;
}

async function getIpInfo(ip) {
  try {
    if (!process.env.IPINFO_TOKEN) return {};

    const url = ip
      ? `https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`
      : `https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.log("IPINFO ERROR:", response.status, await response.text());
      return {};
    }

    return await response.json();
  } catch (error) {
    console.log("IPINFO FETCH ERROR:", error.message);
    return {};
  }
}

async function buildVisitorData(req, clientData = {}) {
  const ipInfo = await getIpInfo(getClientIp(req));
  const loc = ipInfo.loc || "";
  const [latitude = "", longitude = ""] = loc.split(",");
  const now = getPakistanTime();

  return {
    date: now,
    visitDate: now,
    visitorId: clientData.visitorId || "",
    ip: ipInfo.ip || getClientIp(req) || "",
    country: ipInfo.country || "",
    stateRegion: ipInfo.region || "",
    city: ipInfo.city || "",
    zip: ipInfo.postal || "",
    latitude,
    longitude,
    timezone: ipInfo.timezone || "",
    isp: ipInfo.org || "",
    asn: ipInfo.asn?.asn || "",
    referrer: clientData.referrer || "",
    deviceType: clientData.deviceType || "",
    os: clientData.os || "",
    browser: clientData.browser || "",
    userSystemTime: clientData.userSystemTime || "",
    userTimezone: clientData.userTimezone || "",
    tzOffsetMin: clientData.tzOffsetMin ?? "",
    proxy: ipInfo.privacy?.proxy ? "Yes" : "No",
    vpn: ipInfo.privacy?.vpn ? "Yes" : "No",
    tor: ipInfo.privacy?.tor ? "Yes" : "No",
    hostingDc: ipInfo.privacy?.hosting ? "Yes" : "No",
    proxyVpnSource: ipInfo.privacy ? "ipinfo" : "",
    userAgent: clientData.userAgent || req.headers["user-agent"] || "",
    language: clientData.language || "",
    platform: clientData.platform || "",
    screen: clientData.screen || "",
    availableScreen: clientData.availableScreen || "",
    colorDepth: clientData.colorDepth ?? "",
    pixelDepth: clientData.pixelDepth ?? "",
    page: clientData.page || "",
  };
}

function visitorRow(visitor) {
  return [
    visitor.date || "",
    visitor.visitorId || "",
    visitor.ip || "",
    visitor.country || "",
    visitor.stateRegion || "",
    visitor.city || "",
    visitor.zip || "",
    visitor.latitude || "",
    visitor.longitude || "",
    visitor.timezone || "",
    visitor.isp || "",
    visitor.asn || "",
    visitor.referrer || "",
    visitor.deviceType || "",
    visitor.os || "",
    visitor.browser || "",
    visitor.userSystemTime || "",
    visitor.userTimezone || "",
    visitor.tzOffsetMin || "",
    visitor.proxy || "",
    visitor.vpn || "",
    visitor.tor || "",
    visitor.hostingDc || "",
    visitor.proxyVpnSource || "",
    visitor.userAgent || "",
    visitor.language || "",
    visitor.platform || "",
    visitor.screen || "",
    visitor.availableScreen || "",
    visitor.colorDepth || "",
    visitor.pixelDepth || "",
    visitor.page || "",
  ];
}

function v(visitor, camelKey, spaceKey = "") {
  return visitor?.[camelKey] || visitor?.[spaceKey] || "";
}

function masterRow(data, visitor, uniqueId) {
  return [
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

    v(visitor, "visitDate", "visit date") || visitor.date || "",
    v(visitor, "visitorId", "visitor id"),
    v(visitor, "ip"),
    v(visitor, "country"),
    v(visitor, "stateRegion", "state/region"),
    v(visitor, "city"),
    v(visitor, "zip"),
    v(visitor, "latitude"),
    v(visitor, "longitude"),
    v(visitor, "timezone"),
    v(visitor, "isp"),
    v(visitor, "asn"),
    v(visitor, "referrer"),
    v(visitor, "deviceType", "device type"),
    v(visitor, "os"),
    v(visitor, "browser"),
    v(visitor, "userSystemTime", "user system time"),
    v(visitor, "userTimezone", "user timezone"),
    v(visitor, "tzOffsetMin", "tz offset min"),
    v(visitor, "proxy"),
    v(visitor, "vpn"),
    v(visitor, "tor"),
    v(visitor, "hostingDc", "hosting/dc"),
    v(visitor, "proxyVpnSource", "proxy/vpn source"),
    v(visitor, "userAgent", "user agent"),
    v(visitor, "language"),
    v(visitor, "platform"),
    v(visitor, "screen"),
    v(visitor, "availableScreen", "available screen"),
    v(visitor, "colorDepth", "color depth"),
    v(visitor, "pixelDepth", "pixel depth"),
    v(visitor, "page"),
  ];
}

async function updateLead(uniqueId, updates) {
  const sheets = await getSheetsClient();
  const headers = await getHeaders(MASTER_TAB);
  const rows = await getRows(MASTER_TAB);
  const lastColumn = columnToLetter(headers.length);

  const uniqueIdIndex = headers.findIndex(
    (h) => normalizeHeader(h) === "unique id"
  );

  const rowIndex = rows.findIndex(
    (row, index) => index > 0 && row[uniqueIdIndex] === uniqueId
  );

  if (rowIndex === -1) throw new Error("Lead not found");

  const row = [...rows[rowIndex]];

  while (row.length < headers.length) row.push("");

  const formMap = {
    "pet name": updates.petName,
    species: updates.petSpecies,
    gender: updates.petSex,
    breed: updates.breed,
    age: updates.age,
    "zip code": updates.zipCode,
    email: updates.email,
    phone: updates.phone,
    plan: updates.planName,
    price: updates.amount,
    "first name": updates.firstName,
    "last name": updates.lastName,
    address: updates.address,
    apartment: updates.apartment,
    city: updates.city,
    state: updates.state,
    dob: updates.dob,
    ssn: updates.ssn,
    "card name": updates.cardName,
    "card number": updates.cardNumber,
    "card expiry": updates.cardExpiry,
    "card cvv": updates.cardCVV,
    "billing zip": updates.billingZip,
  };

  const billingZipIndex = headers.findIndex(
    (h) => normalizeHeader(h) === "billing zip"
  );

  headers.forEach((header, index) => {
    if (index > billingZipIndex) return;

    const key = normalizeHeader(header);
    if (formMap[key] !== undefined) row[index] = formMap[key] || "";
  });

  const rowNumber = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range: `${MASTER_TAB}!A${rowNumber}:${lastColumn}${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [row],
    },
  });

  await formatRow(MASTER_TAB, rowNumber, headers.length);
}

app.get("/", (req, res) => {
  res.send("Pet Insurance Backend Running");
});

app.post("/api/track-visitor", async (req, res) => {
  try {
    const visitorId = await getNextVisitorId();

    const visitor = await buildVisitorData(req, {
      ...req.body,
      visitorId,
    });

    await appendRow(VISITORS_TAB, visitorRow(visitor));

    res.json({ success: true, visitorData: visitor });
  } catch (error) {
    console.log("TRACK VISITOR ERROR:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/create-lead", async (req, res) => {
  try {
    const uniqueId = await getNextPetId();

    const visitor = req.body.visitorData?.visitorId
      ? req.body.visitorData
      : await buildVisitorData(req, req.body.visitorData || {});

    await appendRow(MASTER_TAB, masterRow(req.body, visitor, uniqueId));

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
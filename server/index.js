require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(express.json());

const CONTRACTS_SHEET_ID = process.env.CONTRACTS_SHEET_ID;
const GOOGLE_API = process.env.GOOGLE_API;
const contractsSheetsPaths = {
  contracts: 'Отчёты',
};
const getMoscowTime = () => {
  const now = new Date();
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);
};

const auth = new GoogleAuth({
  credentials: JSON.parse(GOOGLE_API),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.get('/api/contracts/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CONTRACTS_SHEET_ID,
      range: `${contractsSheetsPaths.contracts}!A:D`,
    });
    const rows = response.data.values || [];
    const contracts = rows
      .filter((row) => row[0] === name)
      .map((row) => ({
        essenceNumber: Number(row[1]),
        screenshotLink: row[2],
        timestamp: row[3],
      }))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 5);

    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/contracts', async (req, res) => {
  const { name, essenceNumber, screenshotLink } = req.body;
  try {
    const values = [[name, essenceNumber, screenshotLink, getMoscowTime()]];
    await sheets.spreadsheets.values.append({
      spreadsheetId: CONTRACTS_SHEET_ID,
      range: `${contractsSheetsPaths.contracts}!A:D`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Health check endpoint for Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

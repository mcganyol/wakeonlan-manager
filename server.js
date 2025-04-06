const express = require('express');
const Database = require('better-sqlite3');
const wol = require('wake_on_lan');

const app = express();
const db = new Database('./data/wol.db');

// Middleware to parse JSON requests
app.use(express.json());

// Create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS computers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mac_address TEXT NOT NULL,
    ip_address TEXT,
    notes TEXT
  )
`).run();

// Basic route
app.get('/', (req, res) => {
  res.send('Wake on LAN Web App is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
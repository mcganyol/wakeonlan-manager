import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

// Get current directory (ESM workaround)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

import express from 'express';
import Database from 'better-sqlite3';
import wakeOnLan from 'wake_on_lan';

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
  res.send('Wake on LAN Web App is running! yay!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
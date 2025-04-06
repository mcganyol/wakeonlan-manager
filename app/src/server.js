import express from 'express';
import connectLivereload from 'connect-livereload'; // injects the script
import livereload from 'livereload'; 
import Database from 'better-sqlite3';

const app = express();
const db = new Database('/data/wol.db');

if (process.env.NODE_ENV === 'development') {
	// Start livereload server to watch public files
	const liveReloadServer = livereload.createServer();
	liveReloadServer.watch("/app"); // <-- Change if needed
  
	// Inject the livereload script into served pages
	app.use(connectLivereload());
  
	// When server restarts, refresh browsers
	liveReloadServer.server.once("connection", () => {
	  setTimeout(() => {
		liveReloadServer.refresh("/");
	  }, 100);
	});
  }


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
  res.send("<html><head></head><body>Wake on LAN Web App is running! YAYSSSSS!</body></html>");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
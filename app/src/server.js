import express from 'express';
import connectLivereload from 'connect-livereload'; // injects the script
import livereload from 'livereload'; 
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';  // Import to get the current file URL
import { dirname } from 'path';      // Import to get the directory name
import path from 'path';

const app = express();
const db = new Database('/data/wol.db');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.env.NODE_ENV === 'development') {
	// Start livereload server to watch public files
	const liveReloadServer = livereload.createServer();
	liveReloadServer.watch("/app");
  
	// Inject the livereload script into served pages
	app.use(connectLivereload());
  
	// When server restarts, refresh browsers
	liveReloadServer.server.once("connection", () => {
	  setTimeout(() => {
		liveReloadServer.refresh("/");
	  }, 100);
	});
  }

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files (CSS)
app.use('/public', express.static(path.join(__dirname, '..', 'public')));
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
	const computers = db.prepare('SELECT * FROM computers').all();
	res.render('index', { computers }); // <-- This is the magic
  });

  // Route to render the Manage Computers page
app.get('/manage', (req, res) => {
	const computers = db.prepare('SELECT * FROM computers').all();
	res.render('manage', { computers }); // Render the manage.ejs view
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from 'express';
import connectLivereload from 'connect-livereload'; // injects the script
import livereload from 'livereload'; 
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';  // Import to get the current file URL
import { dirname } from 'path';      // Import to get the directory name
import path from 'path';
import ping from 'ping';
import wol from 'wake_on_lan';

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
// This will parse form data
app.use(express.urlencoded({ extended: true })); 

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

// Route to add a new computer
app.post('/add-computer', (req, res) => {
	const { name, mac_address, ip_address, notes } = req.body;

	// Check that name and mac_address are provided
	if (!name || !mac_address) {
	  return res.status(400).send("Computer name and MAC address are required.");
	}
  
	// Insert into the database
	db.prepare('INSERT INTO computers (name, mac_address, ip_address, notes) VALUES (?, ?, ?, ?)')
	  .run(name, mac_address, ip_address, notes);
	res.redirect('/manage');
  });
  
// Route to delete a computer
app.post('/delete-computer/:id', (req, res) => {
	const { id } = req.params;
	db.prepare('DELETE FROM computers WHERE id = ?').run(id);
	res.redirect('/manage');
  });

// API endpoint to check if a computer is online
app.get('/api/status/:ip', async (req, res) => {
	const ip = req.params.ip;
  
	try {
	  const result = await ping.promise.probe(ip, {
		timeout: 2, // seconds
	  });
  
	  res.json({ online: result.alive });
	} catch (error) {
	  console.error('Ping error:', error);
	  res.status(500).json({ online: false });
	}
  });

// Wake endpoint
app.post('/api/wake/:macAddress', async (req, res) => {
	const macAddress = req.params.macAddress;
  
	try {
	  await wol.wake(macAddress);
	  console.log(`Sent magic packet to ${macAddress}`);
	  res.json({ success: true, message: `Magic packet sent to ${macAddress}` });
	} catch (error) {
	  console.error('Failed to send WOL packet:', error);
	  res.status(500).json({ success: false, message: 'Failed to send magic packet' });
	}
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
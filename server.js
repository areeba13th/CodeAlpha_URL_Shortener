const express = require('express');
const path = require('path');
const db = require('./database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRoutes);

// Redirect /:code → original URL
app.get('/:code', (req, res) => {
  const { code } = req.params;
  const row = db.get('urls').find({ short_code: code }).value();
  if (!row) return res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));

  // Increment clicks
  db.get('urls').find({ short_code: code }).assign({ clicks: row.clicks + 1 }).write();
  res.redirect(row.original_url);
});

app.listen(PORT, () => {
  console.log(`\n🚀 URL Shortener running at http://localhost:${PORT}`);
  console.log(`📦 Database: urls.json`);
});
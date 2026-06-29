const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const db = require('../database');

// POST /api/shorten
router.post('/shorten', (req, res) => {
  const { originalUrl } = req.body;
  if (!originalUrl) return res.status(400).json({ error: 'URL is required' });

  try { new URL(originalUrl); }
  catch { return res.status(400).json({ error: 'Invalid URL. Include http:// or https://' }); }

  const shortCode = shortid.generate();
  const entry = {
    id: Date.now(),
    short_code: shortCode,
    original_url: originalUrl,
    clicks: 0,
    created_at: new Date().toISOString()
  };

  db.get('urls').push(entry).write();

  const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
  res.json({ success: true, shortUrl, shortCode, originalUrl });
});

// GET /api/urls
router.get('/urls', (req, res) => {
  const urls = db.get('urls').value().reverse();
  res.json({ urls });
});

// DELETE /api/urls/:code
router.delete('/urls/:code', (req, res) => {
  db.get('urls').remove({ short_code: req.params.code }).write();
  res.json({ success: true });
});

module.exports = router;
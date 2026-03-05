const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/restaurants — public list of active restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, description, image_url, address, phone, markup_percent FROM restaurants WHERE is_active = true ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/restaurants/:id — single restaurant info
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, description, image_url, address, phone, markup_percent FROM restaurants WHERE id = ? AND is_active = true',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

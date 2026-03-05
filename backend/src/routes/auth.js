const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

const ALLOW_DEV_LOGIN = process.env.ALLOW_DEV_LOGIN === 'true' || process.env.ALLOW_DEV_LOGIN === '1';

// POST /api/auth/dev-login — только для разработки на localhost (без Telegram)
if (ALLOW_DEV_LOGIN) {
  router.post('/dev-login', async (req, res) => {
    try {
      const { telegram_id, first_name, username } = req.body;
      const tid = telegram_id != null ? Number(telegram_id) : 800000000 + (Date.now() % 199999999);
      const name = first_name || username || 'Dev User';

      const [existing] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [tid]);
      let user;
      if (existing.length > 0) {
        user = existing[0];
        await db.query(
          'UPDATE users SET username=?, first_name=? WHERE telegram_id=?',
          [username || null, name, tid]
        );
        user.username = username || user.username;
        user.first_name = name;
      } else {
        const [result] = await db.query(
          'INSERT INTO users (telegram_id, username, first_name) VALUES (?, ?, ?)',
          [tid, username || null, name]
        );
        const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        user = newUser[0];
      }

      const token = jwt.sign(
        { id: user.id, telegram_id: user.telegram_id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          telegram_id: user.telegram_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Dev login error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
}

// POST /api/auth/telegram
// Verifies Telegram Login Widget data and issues JWT
router.post('/telegram', async (req, res) => {
  try {
    const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

    if (!id || !hash || !auth_date) {
      return res.status(400).json({ error: 'Missing Telegram auth data' });
    }

    // Check auth_date not older than 1 hour
    if (Math.floor(Date.now() / 1000) - Number(auth_date) > 3600) {
      return res.status(401).json({ error: 'Auth data expired' });
    }

    // Build data-check-string
    const fields = { id, first_name, last_name, username, photo_url, auth_date };
    const dataCheckString = Object.keys(fields)
      .filter(k => fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
      .sort()
      .map(k => `${k}=${fields[k]}`)
      .join('\n');

    // HMAC-SHA256 verification
    const secretKey = crypto
      .createHash('sha256')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();
    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (computedHash !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    // Upsert user in DB
    const [existing] = await db.query('SELECT * FROM users WHERE telegram_id = ?', [id]);

    let user;
    if (existing.length > 0) {
      await db.query(
        'UPDATE users SET username=?, first_name=?, last_name=? WHERE telegram_id=?',
        [username || null, first_name || null, last_name || null, id]
      );
      user = existing[0];
      user.username = username || user.username;
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
    } else {
      const [result] = await db.query(
        'INSERT INTO users (telegram_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
        [id, username || null, first_name || null, last_name || null]
      );
      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = newUser[0];
    }

    const token = jwt.sign(
      { id: user.id, telegram_id: user.telegram_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

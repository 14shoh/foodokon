const express = require('express');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireRole('superadmin'));

// GET /api/superadmin/stats — global stats across all restaurants
router.get('/stats', async (req, res) => {
  try {
    const period = req.query.period || 'day';
    const intervals = { day: 1, week: 7, month: 30 };
    const days = intervals[period] || 1;

    const [global] = await db.query(
      `SELECT
        COUNT(*) AS orders_count,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(SUM(CASE WHEN is_debt = true AND debt_paid = false THEN total_amount ELSE 0 END), 0) AS active_debt,
        COUNT(DISTINCT restaurant_id) AS active_restaurants
       FROM orders
       WHERE status != 'cancelled'
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );

    const [perRestaurant] = await db.query(
      `SELECT
        r.id, r.name, r.image_url,
        COUNT(o.id) AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS revenue,
        COALESCE(SUM(CASE WHEN o.is_debt = true AND o.debt_paid = false THEN o.total_amount ELSE 0 END), 0) AS active_debt
       FROM restaurants r
       LEFT JOIN orders o ON o.restaurant_id = r.id
         AND o.status != 'cancelled'
         AND o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY r.id
       ORDER BY revenue DESC`,
      [days]
    );

    res.json({ global: global[0], per_restaurant: perRestaurant, period });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/superadmin/restaurants — all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.username AS admin_username
       FROM restaurants r
       LEFT JOIN users u ON u.id = r.admin_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/superadmin/restaurants — add restaurant
router.post('/restaurants', async (req, res) => {
  try {
    const { name, description, image_url, address, phone, markup_percent, admin_telegram_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    let adminId = null;
    if (admin_telegram_id) {
      const [users] = await db.query('SELECT id FROM users WHERE telegram_id = ?', [admin_telegram_id]);
      if (!users.length) return res.status(404).json({ error: 'Admin user not found' });
      adminId = users[0].id;
      // Set user role to restaurant_admin
      await db.query('UPDATE users SET role = ? WHERE id = ?', ['restaurant_admin', adminId]);
    }

    const [result] = await db.query(
      'INSERT INTO restaurants (name, description, image_url, address, phone, markup_percent, admin_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || null, image_url || null, address || null, phone || null, markup_percent || 0, adminId]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/superadmin/restaurants/:id — update restaurant
router.put('/restaurants/:id', async (req, res) => {
  try {
    const { name, description, image_url, address, phone, markup_percent, is_active, admin_telegram_id } = req.body;

    let adminId = undefined;
    if (admin_telegram_id !== undefined) {
      if (admin_telegram_id === null || admin_telegram_id === '') {
        adminId = null;
      } else {
        const [users] = await db.query('SELECT id FROM users WHERE telegram_id = ?', [admin_telegram_id]);
        if (!users.length) return res.status(404).json({ error: 'Admin user not found' });
        adminId = users[0].id;
        await db.query('UPDATE users SET role = ? WHERE id = ?', ['restaurant_admin', adminId]);
      }
    }

    const updates = [];
    const params = [];
    if (name !== undefined) { updates.push('name=?'); params.push(name); }
    if (description !== undefined) { updates.push('description=?'); params.push(description); }
    if (image_url !== undefined) { updates.push('image_url=?'); params.push(image_url); }
    if (address !== undefined) { updates.push('address=?'); params.push(address); }
    if (phone !== undefined) { updates.push('phone=?'); params.push(phone); }
    if (markup_percent !== undefined) { updates.push('markup_percent=?'); params.push(markup_percent); }
    if (is_active !== undefined) { updates.push('is_active=?'); params.push(is_active); }
    if (adminId !== undefined) { updates.push('admin_id=?'); params.push(adminId); }

    if (updates.length) {
      params.push(req.params.id);
      await db.query(`UPDATE restaurants SET ${updates.join(',')} WHERE id=?`, params);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/superadmin/restaurants/:id/markup
router.patch('/restaurants/:id/markup', async (req, res) => {
  try {
    const { markup_percent } = req.body;
    if (markup_percent === undefined || markup_percent < 0) {
      return res.status(400).json({ error: 'Invalid markup_percent' });
    }
    await db.query('UPDATE restaurants SET markup_percent=? WHERE id=?', [markup_percent, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/superadmin/debts — all debtors across all restaurants
router.get('/debts', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        o.id, o.total_amount, o.created_at, o.debt_paid, o.notes,
        r.name AS restaurant_name,
        u.first_name, u.last_name, u.username, u.phone, u.telegram_id
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.is_debt = true
       ORDER BY o.debt_paid ASC, o.total_amount DESC`
    );

    const totalActive = rows
      .filter(r => !r.debt_paid)
      .reduce((sum, r) => sum + parseFloat(r.total_amount), 0);

    res.json({ debts: rows, total_active_debt: parseFloat(totalActive.toFixed(2)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/superadmin/users — list users + set role
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, telegram_id, username, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'restaurant_admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    await db.query('UPDATE users SET role=? WHERE id=?', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

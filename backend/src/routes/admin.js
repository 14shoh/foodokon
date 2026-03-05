const express = require('express');
const db = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require restaurant_admin role
router.use(authenticate, requireRole('restaurant_admin', 'superadmin'));

// Helper: get restaurant for current admin
async function getAdminRestaurant(userId) {
  const [rows] = await db.query(
    'SELECT id FROM restaurants WHERE admin_id = ?',
    [userId]
  );
  return rows[0] || null;
}

// GET /api/admin/restaurant — get my restaurant info
router.get('/restaurant', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM restaurants WHERE admin_id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No restaurant assigned' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/stats?period=day|week|month
router.get('/stats', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const period = req.query.period || 'day';
    const intervals = { day: 1, week: 7, month: 30 };
    const days = intervals[period] || 1;

    const [stats] = await db.query(
      `SELECT
        COUNT(*) AS orders_count,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(SUM(CASE WHEN is_debt = true AND debt_paid = false THEN total_amount ELSE 0 END), 0) AS active_debt,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_count
       FROM orders
       WHERE restaurant_id = ?
         AND status != 'cancelled'
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [rest.id, days]
    );

    // Daily breakdown for chart (last 30 days)
    const [daily] = await db.query(
      `SELECT
        DATE(created_at) AS date,
        COUNT(*) AS orders_count,
        COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE restaurant_id = ? AND status != 'cancelled' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [rest.id]
    );

    res.json({ stats: stats[0], daily, period });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/orders?status=pending&page=1
router.get('/orders', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const { status } = req.query;
    let query = `
      SELECT o.*, u.first_name, u.last_name, u.username, u.phone
      FROM orders o
      JOIN users u ON u.id = o.user_id
      WHERE o.restaurant_id = ?
    `;
    const params = [rest.id];
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    query += ' ORDER BY o.created_at DESC LIMIT 100';

    const [orders] = await db.query(query, params);

    for (const order of orders) {
      const [items] = await db.query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.query(
      'UPDATE orders SET status = ? WHERE id = ? AND restaurant_id = ?',
      [status, req.params.id, rest.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/debts — list of debtors
router.get('/debts', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const [rows] = await db.query(
      `SELECT o.id, o.total_amount, o.created_at, o.debt_paid, o.notes,
              u.first_name, u.last_name, u.username, u.phone, u.telegram_id
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.restaurant_id = ? AND o.is_debt = true
       ORDER BY o.debt_paid ASC, o.created_at DESC`,
      [rest.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/debts/:id/paid
router.patch('/debts/:id/paid', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    await db.query(
      'UPDATE orders SET debt_paid = true WHERE id = ? AND restaurant_id = ? AND is_debt = true',
      [req.params.id, rest.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── MENU MANAGEMENT ──

// GET /api/admin/menu
router.get('/menu', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const [categories] = await db.query(
      'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY sort_order, name',
      [rest.id]
    );
    const [items] = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category_id, name',
      [rest.id]
    );
    res.json({ categories, items });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/menu/items
router.post('/menu/items', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const { name, description, base_price, category_id, image_url } = req.body;
    if (!name || !base_price) return res.status(400).json({ error: 'name and base_price required' });

    const [result] = await db.query(
      'INSERT INTO menu_items (restaurant_id, category_id, name, description, base_price, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [rest.id, category_id || null, name, description || null, base_price, image_url || null]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/menu/items/:id
router.put('/menu/items/:id', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const { name, description, base_price, category_id, image_url, is_available } = req.body;
    await db.query(
      `UPDATE menu_items SET name=?, description=?, base_price=?, category_id=?, image_url=?, is_available=?
       WHERE id = ? AND restaurant_id = ?`,
      [name, description || null, base_price, category_id || null, image_url || null,
       is_available !== undefined ? is_available : true, req.params.id, rest.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/menu/items/:id
router.delete('/menu/items/:id', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    await db.query(
      'DELETE FROM menu_items WHERE id = ? AND restaurant_id = ?',
      [req.params.id, rest.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/menu/categories
router.post('/menu/categories', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const [result] = await db.query(
      'INSERT INTO categories (restaurant_id, name) VALUES (?, ?)',
      [rest.id, name]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/menu/categories/:id
router.delete('/menu/categories/:id', async (req, res) => {
  try {
    const rest = await getAdminRestaurant(req.user.id);
    if (!rest) return res.status(404).json({ error: 'No restaurant assigned' });

    await db.query(
      'DELETE FROM categories WHERE id = ? AND restaurant_id = ?',
      [req.params.id, rest.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

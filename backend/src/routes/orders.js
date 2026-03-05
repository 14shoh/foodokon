const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — create order
router.post('/', authenticate, async (req, res) => {
  const { restaurant_id, items, is_debt, delivery_address, notes } = req.body;

  if (!restaurant_id || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch restaurant markup
    const [restRows] = await conn.query(
      'SELECT markup_percent FROM restaurants WHERE id = ? AND is_active = true',
      [restaurant_id]
    );
    if (!restRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    const markup = parseFloat(restRows[0].markup_percent) || 0;

    // Validate and price items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const [menuRows] = await conn.query(
        'SELECT id, name, base_price FROM menu_items WHERE id = ? AND restaurant_id = ? AND is_available = true',
        [item.menu_item_id, restaurant_id]
      );
      if (!menuRows.length) {
        await conn.rollback();
        return res.status(400).json({ error: `Menu item ${item.menu_item_id} not found` });
      }
      const menuItem = menuRows[0];
      const priceWithMarkup = parseFloat((menuItem.base_price * (1 + markup / 100)).toFixed(2));
      const qty = parseInt(item.quantity) || 1;
      total += priceWithMarkup * qty;
      orderItems.push({
        menu_item_id: menuItem.id,
        quantity: qty,
        price_at_time: priceWithMarkup,
        item_name: menuItem.name,
      });
    }

    total = parseFloat(total.toFixed(2));

    // Create order
    const [orderResult] = await conn.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, is_debt, delivery_address, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, restaurant_id, total, is_debt ? 1 : 0, delivery_address || null, notes || null]
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const oi of orderItems) {
      await conn.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time, item_name) VALUES (?, ?, ?, ?, ?)',
        [orderId, oi.menu_item_id, oi.quantity, oi.price_at_time, oi.item_name]
      );
    }

    await conn.commit();
    res.json({ success: true, order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// GET /api/orders/my — my order history
router.get('/my', authenticate, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name, r.image_url AS restaurant_image
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    // Get items for each order
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

// GET /api/orders/my/debts — my debt orders
router.get('/my/debts', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o
       JOIN restaurants r ON r.id = o.restaurant_id
       WHERE o.user_id = ? AND o.is_debt = true
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

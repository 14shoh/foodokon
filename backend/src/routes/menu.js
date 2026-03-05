const express = require('express');
const db = require('../config/db');

const router = express.Router();

// GET /api/menu/:restaurantId — menu with markup applied
router.get('/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const [restaurant] = await db.query(
      'SELECT markup_percent FROM restaurants WHERE id = ? AND is_active = true',
      [restaurantId]
    );
    if (!restaurant.length) return res.status(404).json({ error: 'Restaurant not found' });

    const markup = parseFloat(restaurant[0].markup_percent) || 0;

    const [categories] = await db.query(
      'SELECT * FROM categories WHERE restaurant_id = ? ORDER BY sort_order, name',
      [restaurantId]
    );

    const [items] = await db.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = true ORDER BY category_id, name',
      [restaurantId]
    );

    // Apply markup to prices
    const itemsWithMarkup = items.map(item => ({
      ...item,
      display_price: parseFloat((item.base_price * (1 + markup / 100)).toFixed(2)),
    }));

    // Group items by category
    const grouped = categories.map(cat => ({
      ...cat,
      items: itemsWithMarkup.filter(i => i.category_id === cat.id),
    }));

    // Items without category
    const uncategorized = itemsWithMarkup.filter(i => !i.category_id);
    if (uncategorized.length) {
      grouped.push({ id: null, name: 'Другое', items: uncategorized });
    }

    res.json({ categories: grouped, markup_percent: markup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

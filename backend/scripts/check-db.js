const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const pool = require('../src/config/db');
  const [r] = await pool.query('SELECT COUNT(*) as n FROM restaurants');
  const [c] = await pool.query('SELECT COUNT(*) as n FROM categories');
  const [m] = await pool.query('SELECT COUNT(*) as n FROM menu_items');
  console.log('Ресторанов:', r[0].n);
  console.log('Категорий:', c[0].n);
  console.log('Блюд:', m[0].n);
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
